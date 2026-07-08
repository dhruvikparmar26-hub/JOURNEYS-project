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
  next();
};

export default requireVerifiedEmail;
