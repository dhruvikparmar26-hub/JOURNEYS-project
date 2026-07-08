import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for failed login attempts on non-existent accounts
    },
    event: {
      type: String,
      required: true,
      enum: [
        'signup',
        'login',
        'login_failed',
        'logout',
        'token_refresh',
        'token_reuse_detected',
        'email_verified',
        'password_reset_requested',
        'password_reset_completed',
        '2fa_enrolled',
        '2fa_verified',
        '2fa_disabled',
        'account_locked',
        'google_oauth_login',
        'guest_itineraries_claimed',
        'profile_update',
      ],
      index: true,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // No updatedAt needed for immutable logs
    timestamps: false,
  }
);

// TTL index: auto-delete logs older than 90 days to manage storage
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
