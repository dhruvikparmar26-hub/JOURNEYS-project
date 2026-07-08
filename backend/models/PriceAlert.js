import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * PriceAlert
 * A user-defined threshold for a specific origin/destination route.
 * A background job (jobs/priceAlertChecker.js) periodically re-quotes
 * the route cost and notifies the user when price <= thresholdAmount.
 */
const PriceAlertSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    origin: {
      label: { type: String, required: true, trim: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    destination: {
      label: { type: String, required: true, trim: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    mode: {
      type: String,
      enum: ['cab', 'bus', 'train', 'flight', 'all'],
      default: 'all',
    },
    thresholdAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: { type: String, default: 'INR' },
    lastCheckedPrice: { type: Number, default: null },
    lastCheckedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'triggered', 'paused', 'expired'],
      default: 'active',
    },
    triggeredAt: { type: Date, default: null },
    // stop checking after this date (e.g. trip date has passed)
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PriceAlertSchema.index({ status: 1, expiresAt: 1 });
PriceAlertSchema.index({ user: 1, createdAt: -1 });

const PriceAlert = mongoose.model('PriceAlert', PriceAlertSchema);

export default PriceAlert;
