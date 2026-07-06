/**
 * Middleware: Require that the authenticated user has a verified email.
 * Must be used AFTER requireAuth middleware.
 *
 * Used on routes that hit paid external APIs (routing, LLM calls)
 * to prevent unverified accounts from incurring costs.
 */
const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NO_AUTH',
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      error: 'Email verification required. Please verify your email before accessing this feature.',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  next();
};

export default requireVerifiedEmail;
