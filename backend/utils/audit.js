import AuditLog from '../models/AuditLog.js';

/**
 * Log an authentication event to the audit log collection
 *
 * @param {string|null} userId - The user ID (null for anonymous events like failed lookups)
 * @param {string} event - Event type (must be a valid AuditLog.event enum value)
 * @param {object} req - Express request object (for IP and User-Agent extraction)
 * @param {object} metadata - Additional event-specific data
 */
export const logAuthEvent = async (userId, event, req, metadata = {}) => {
  try {
    await AuditLog.create({
      userId,
      event,
      ip: req.ip || req.connection?.remoteAddress || null,
      userAgent: req.get('User-Agent') || null,
      metadata,
    });
  } catch (error) {
    // Audit logging should never crash the request
    console.error('⚠️  Audit log write failed:', error.message);
  }
};
