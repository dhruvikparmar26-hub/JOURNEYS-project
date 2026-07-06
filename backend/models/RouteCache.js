import mongoose from 'mongoose';

/**
 * RouteCache Schema
 *
 * Caches responses from the Google Routes API to avoid redundant external billing.
 * Coordinates are rounded to 3 decimal places (~110 meters accuracy).
 *
 * TTL index is set on `createdAt` to automatically expire records after 24 hours.
 */
const routeCacheSchema = new mongoose.Schema({
  originLatRounded: { type: Number, required: true },
  originLngRounded: { type: Number, required: true },
  destLatRounded: { type: Number, required: true },
  destLngRounded: { type: Number, required: true },
  distanceMeters: { type: Number, required: true },
  durationSeconds: { type: Number, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // 24 hours TTL index
  },
});

// Compound indexes for fast coordinate lookups
routeCacheSchema.index({
  originLatRounded: 1,
  originLngRounded: 1,
  destLatRounded: 1,
  destLngRounded: 1,
});

const RouteCache = mongoose.model('RouteCache', routeCacheSchema);

export default RouteCache;
