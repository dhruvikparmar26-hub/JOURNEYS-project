import { verifyAccessToken } from '../utils/tokens.js';
import User from '../models/User.js';

/**
 * optionalAuth
 * Like requireAuth, but never blocks the request. If a valid access token
 * is present (Authorization: Bearer <token>), it attaches req.user.
 * If missing/invalid, it just moves on (req.user stays undefined) so that
 * guestSession's req.guestId can be used instead.
 *
 * This lets endpoints like /api/wishlist work for both guests and
 * logged-in users without duplicating routes.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) return next();

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (user) {
      req.user = user;
    }
    return next();
  } catch (err) {
    // invalid/expired token -> just treat as guest, don't fail the request
    return next();
  }
};

export default optionalAuth;
