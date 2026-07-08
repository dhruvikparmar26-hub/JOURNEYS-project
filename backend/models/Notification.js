import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'itinerary_saved',
        'booking_confirmed',
        'itinerary_ready',
        'review_submitted',
        'group_trip_joined',
        'price_alert_triggered',
        'wishlist_price_drop',
        'coupon_available',
        'trip_reminder',
        'weather_alert',
        'support_reply',
        'group_activity',
        'system_announcement',
        'booking_cancelled',
        'review_response',
        'loyalty_upgrade',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedItineraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Itinerary',
      default: null,
    },
    // ─── New Fields ─────────────────────────────────────
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    category: {
      type: String,
      enum: ['trip', 'booking', 'social', 'system', 'promotion'],
      default: 'system',
    },
    actionUrl: {
      type: String,
      default: '',
    },
    actionLabel: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'notifications',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
