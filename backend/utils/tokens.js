import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate a short-lived access token (15 minutes)
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate a random refresh token (32 bytes, hex-encoded)
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a refresh token using SHA-256 for storage in the database.
 * We never store raw refresh tokens — a DB leak should not yield
 * working sessions.
 */
export const hashRefreshToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

/**
 * Generate a signed email verification or password reset token
 * @param {string} userId
 * @param {'email-verify' | 'password-reset'} purpose
 */
export const generateEmailToken = (userId, purpose) => {
  return jwt.sign(
    { userId, purpose },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Verify an email/password-reset token
 */
export const verifyEmailToken = (token, expectedPurpose) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.purpose !== expectedPurpose) {
    throw new Error('Token purpose mismatch');
  }
  return decoded;
};

/**
 * Generate a temporary token for 2FA login flow
 * Valid for 5 minutes — only grants access to the 2FA verification endpoint
 */
export const generateTempTwoFactorToken = (userId) => {
  return jwt.sign(
    { userId, type: '2fa-pending' },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );
};

/**
 * Verify a temp 2FA token
 */
export const verifyTempTwoFactorToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.type !== '2fa-pending') {
    throw new Error('Invalid token type');
  }
  return decoded;
};
