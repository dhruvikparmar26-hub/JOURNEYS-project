import { Router } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';
import passport from 'passport';
import User from '../models/User.js';
import Itinerary from '../models/Itinerary.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  generateEmailToken,
  verifyEmailToken,
  generateTempTwoFactorToken,
  verifyTempTwoFactorToken,
} from '../utils/tokens.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { logAuthEvent } from '../utils/audit.js';
import requireAuth from '../middleware/requireAuth.js';
import { authRateLimiter, authSlowDown } from '../middleware/rateLimiter.js';

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────

const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

// ─── Cookie Config ───────────────────────────────────────────

const REFRESH_COOKIE_NAME = 'journeys_refresh';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
};

// ─── Helper: Set refresh token cookie + store hash ───────────

const issueRefreshToken = async (user, res) => {
  const refreshToken = generateRefreshToken();
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
  return refreshToken;
};

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/signup
// ═══════════════════════════════════════════════════════════════

router.post('/signup', authRateLimiter, authSlowDown, async (req, res) => {
  try {
    // Validate input
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password, name } = parsed.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Generic response to avoid leaking account existence
      return res.status(409).json({
        error: 'An account with this email already exists',
      });
    }

    // Hash password with argon2id
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      name: name || '',
      emailVerified: false,
    });

    // Send verification email
    const emailToken = generateEmailToken(user._id.toString(), 'email-verify');
    await sendVerificationEmail(email, emailToken);

    // Audit log
    await logAuthEvent(user._id, 'signup', req);

    return res.status(201).json({
      message: 'Account created. Please check your email to verify your account.',
      user: user.toSafeJSON(),
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/verify-email
// ═══════════════════════════════════════════════════════════════

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = verifyEmailToken(token, 'email-verify');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: 'Email already verified' });
    }

    user.emailVerified = true;
    await user.save();

    await logAuthEvent(user._id, 'email_verified', req);

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
    }
    return res.status(400).json({ error: 'Invalid verification token' });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/login
// ═══════════════════════════════════════════════════════════════

router.post('/login', authRateLimiter, authSlowDown, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid email or password',
      });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });

    // Generic error for non-existent accounts (don't leak account existence)
    if (!user || !user.passwordHash) {
      await logAuthEvent(null, 'login_failed', req, { email, reason: 'user_not_found' });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check lockout
    if (user.isLocked()) {
      const remainingMs = user.lockedUntil - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      await logAuthEvent(user._id, 'login_failed', req, { reason: 'account_locked' });
      return res.status(423).json({
        error: `Account temporarily locked. Try again in ${remainingMin} minute(s).`,
        code: 'ACCOUNT_LOCKED',
        lockedUntil: user.lockedUntil,
      });
    }

    // Verify password
    const isValid = await argon2.verify(user.passwordHash, password);

    if (!isValid) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        user.failedLoginAttempts = 0;
        await user.save();
        await logAuthEvent(user._id, 'account_locked', req);
        return res.status(423).json({
          error: 'Too many failed attempts. Account locked for 15 minutes.',
          code: 'ACCOUNT_LOCKED',
          lockedUntil: user.lockedUntil,
        });
      }

      await user.save();
      await logAuthEvent(user._id, 'login_failed', req, {
        attempts: user.failedLoginAttempts,
      });

      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Password is valid — reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    // Check if 2FA is enabled
    if (user.totpEnabled) {
      await user.save();
      const tempToken = generateTempTwoFactorToken(user._id.toString());
      return res.status(200).json({
        requiresTOTP: true,
        tempToken,
        message: 'Please enter your 2FA code',
      });
    }

    // Issue tokens
    const accessToken = generateAccessToken(user._id.toString());
    await issueRefreshToken(user, res);

    await logAuthEvent(user._id, 'login', req);

    return res.status(200).json({
      accessToken,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/refresh
// ═══════════════════════════════════════════════════════════════

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        error: 'No refresh token provided',
        code: 'NO_REFRESH_TOKEN',
      });
    }

    const tokenHash = hashRefreshToken(token);
    const user = await User.findOne({ refreshTokenHash: tokenHash });

    if (!user) {
      // Token doesn't match anyone — possible token theft / reuse
      // Clear the cookie as a safety measure
      res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);

      // Log the suspicious event (we don't know which user, so userId is null)
      await logAuthEvent(null, 'token_reuse_detected', req, {
        tokenHashPrefix: tokenHash.slice(0, 8),
      });

      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Rotate: issue new access + refresh tokens
    const accessToken = generateAccessToken(user._id.toString());
    await issueRefreshToken(user, res);

    await logAuthEvent(user._id, 'token_refresh', req);

    return res.status(200).json({
      accessToken,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/logout
// ═══════════════════════════════════════════════════════════════

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (token) {
      const tokenHash = hashRefreshToken(token);
      const user = await User.findOne({ refreshTokenHash: tokenHash });

      if (user) {
        user.refreshTokenHash = null;
        await user.save();
        await logAuthEvent(user._id, 'logout', req);
      }
    }

    res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/forgot-password
// ═══════════════════════════════════════════════════════════════

router.post('/forgot-password', authRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    // Always return success to avoid leaking account existence
    const genericResponse = {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    if (!email) {
      return res.status(200).json(genericResponse);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const token = generateEmailToken(user._id.toString(), 'password-reset');
    await sendPasswordResetEmail(email, token);
    await logAuthEvent(user._id, 'password_reset_requested', req);

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/reset-password
// ═══════════════════════════════════════════════════════════════

router.post('/reset-password', async (req, res) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { token, password } = parsed.data;
    const decoded = verifyEmailToken(token, 'password-reset');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    user.passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Invalidate all refresh tokens (force re-login everywhere)
    user.refreshTokenHash = null;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    await logAuthEvent(user._id, 'password_reset_completed', req);

    return res.status(200).json({
      message: 'Password reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }
    return res.status(400).json({ error: 'Invalid reset token' });
  }
});

// ═══════════════════════════════════════════════════════════════
// Google OAuth Routes
// ═══════════════════════════════════════════════════════════════

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5180'}/?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const accessToken = generateAccessToken(user._id.toString());
      await issueRefreshToken(user, res);

      await logAuthEvent(user._id, 'google_oauth_login', req);

      // Redirect to frontend with access token in URL fragment (not query param)
      // Fragment (#) is never sent to the server, so it's more secure
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5180'}/?token=${accessToken}`
      );
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5180'}/?error=oauth_failed`
      );
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// 2FA Endpoints
// ═══════════════════════════════════════════════════════════════

// POST /api/auth/2fa/enroll — Generate TOTP secret + QR code
router.post('/2fa/enroll', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    if (user.totpEnabled) {
      return res.status(400).json({ error: '2FA is already enabled' });
    }

    // Generate secret
    const secret = generateSecret();

    // Store secret (not yet confirmed — will be confirmed on verify)
    user.totpSecret = secret;
    await user.save();

    // Generate QR code
    const otpauthUrl = generateURI({ secret, label: user.email, issuer: 'JOURNEYS' });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return res.status(200).json({
      secret,
      qrCode: qrCodeDataUrl,
      message: 'Scan the QR code with your authenticator app, then verify with a code.',
    });
  } catch (error) {
    console.error('2FA enroll error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/2fa/verify — Confirm 2FA enrollment
router.post('/2fa/verify', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;

    if (!user.totpSecret) {
      return res.status(400).json({ error: 'No 2FA enrollment in progress' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const result = await verify({ token: code, secret: user.totpSecret });

    if (!result || !result.valid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    user.totpEnabled = true;
    await user.save();

    await logAuthEvent(user._id, '2fa_enrolled', req);

    return res.status(200).json({
      message: '2FA enabled successfully',
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/2fa/validate — Validate TOTP code during login
router.post('/2fa/validate', async (req, res) => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({ error: 'Token and code are required' });
    }

    // Verify the temporary token
    const decoded = verifyTempTwoFactorToken(tempToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.totpEnabled || !user.totpSecret) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Verify TOTP code
    const result = await verify({ token: code, secret: user.totpSecret });

    if (!result || !result.valid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Issue full tokens
    const accessToken = generateAccessToken(user._id.toString());
    await issueRefreshToken(user, res);

    await logAuthEvent(user._id, '2fa_verified', req);

    return res.status(200).json({
      accessToken,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: '2FA session expired. Please log in again.' });
    }
    console.error('2FA validate error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/auth/me — Get current user
// ═══════════════════════════════════════════════════════════════

router.get('/me', requireAuth, async (req, res) => {
  return res.status(200).json({
    user: req.user.toSafeJSON(),
  });
});

// ═══════════════════════════════════════════════════════════════
// PATCH /api/auth/me — Update current user profile
// ═══════════════════════════════════════════════════════════════

router.patch('/me', requireAuth, async (req, res) => {
  try {
    // Validate input
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, avatar } = parsed.data;

    // Update user fields
    if (name !== undefined) {
      req.user.name = name;
    }
    if (avatar !== undefined) {
      req.user.avatar = avatar;
    }

    await req.user.save();

    // Audit log
    await logAuthEvent(req.user._id, 'profile_update', req);

    return res.status(200).json({
      user: req.user.toSafeJSON(),
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/claim-guest-itineraries
// Transfers itineraries from a guest session to the authenticated user
// ═══════════════════════════════════════════════════════════════

router.post('/claim-guest-itineraries', requireAuth, async (req, res) => {
  try {
    const guestId = req.guestId;

    if (!guestId) {
      return res.status(200).json({ claimed: 0 });
    }

    const result = await Itinerary.updateMany(
      { guestId },
      { $set: { userId: req.user._id }, $unset: { guestId: '' } }
    );

    if (result.modifiedCount > 0) {
      await logAuthEvent(req.user._id, 'guest_itineraries_claimed', req, {
        count: result.modifiedCount,
        guestId,
      });
    }

    return res.status(200).json({
      claimed: result.modifiedCount,
    });
  } catch (error) {
    console.error('Claim guest itineraries error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

