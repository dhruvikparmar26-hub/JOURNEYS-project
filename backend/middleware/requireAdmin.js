/**
 * requireAdmin
 * Use AFTER requireAuth. Blocks the request unless req.user.role === 'admin'.
 *
 * Assumes the User model has (or will have) a `role` field, e.g.:
 *   role: { type: String, enum: ['user', 'admin'], default: 'user' }
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export default requireAdmin;
