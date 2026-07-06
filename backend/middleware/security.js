import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import crypto from 'crypto';

/**
 * Apply all global security middleware to the Express app
 */
export const applySecurityMiddleware = (app) => {
  // Helmet — sets security headers (CSP, HSTS, X-Frame-Options, etc.)
  app.use(helmet());

  // CORS — locked to the known frontend origin
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5180',
      credentials: true, // Required for httpOnly cookies
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
      maxAge: 86400, // Preflight cache for 24 hours
    })
  );

  // MongoDB query injection protection
  // Strips $where, $gt, and other operators from req.body, req.query, req.params
  app.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        console.warn(`⚠️  Sanitized NoSQL operator in ${key} from ${req.ip}`);
      },
    })
  );
};

/**
 * CSRF protection via double-submit cookie pattern.
 * Only needed for routes that use cookie-based auth (refresh endpoint).
 *
 * How it works:
 * 1. Server sets a random CSRF token as a non-httpOnly cookie (readable by JS)
 * 2. Client reads that cookie and sends the value in the X-CSRF-Token header
 * 3. Server compares the cookie value with the header value
 *
 * This works because:
 * - An attacker on a different origin can trigger a request that sends cookies
 *   but CANNOT read the cookie value (same-origin policy)
 * - Therefore they can't set the matching X-CSRF-Token header
 */
export const csrfProtection = (req, res, next) => {
  // Skip for GET/HEAD/OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      error: 'CSRF token mismatch',
      code: 'CSRF_FAILED',
    });
  }

  next();
};

/**
 * Set a CSRF cookie (call this after login/refresh to give the client a token)
 */
export const setCsrfCookie = (res) => {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie('csrf-token', token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
