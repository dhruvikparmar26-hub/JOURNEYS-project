/**
 * SERVER.JS WIRING
 * ----------------
 * Add these lines to your existing backend/server.js in the indicated spots.
 * Do NOT replace your file — merge these additions in.
 */

// 1) Near your other route imports, add:
const reviewsRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const priceAlertsRoutes = require('./routes/priceAlerts');
const groupTripsRoutes = require('./routes/groupTrips');
const packingListRoutes = require('./routes/packingList');
const analyticsRoutes = require('./routes/analytics');
const { startPriceAlertScheduler } = require('./jobs/priceAlertChecker');

// 2) Near your other app.use('/api/...') mounts, add:
app.use('/api/reviews', reviewsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/price-alerts', priceAlertsRoutes);
app.use('/api/group-trips', groupTripsRoutes);
app.use('/api/packing-list', packingListRoutes);
app.use('/api/analytics', analyticsRoutes);

// 3) After your MongoDB connection succeeds (same place you call app.listen),
//    start the price alert cron job:
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  startPriceAlertScheduler();
  app.listen(process.env.PORT || 5050, () => {
    console.log(`Server running on port ${process.env.PORT || 5050}`);
  });
});

/**
 * PACKAGE INSTALLS
 * ----------------
 * From your backend/ folder run:
 *
 *   npm install node-cron
 *
 * (zod, jsonwebtoken, mongoose, express should already be installed
 *  since your existing auth/trip-request routes use them.)
 */

/**
 * .ENV ADDITIONS (optional)
 * -------------------------
 * PRICE_ALERT_CRON=0 */6 * * *     # every 6 hours, cron syntax - optional, has a default
 * ANTHROPIC_API_KEY=sk - ant -...      # optional - enables AI - generated packing lists,
 *                                   # falls back to rule - based generation if absent
  */

/**
 * USER MODEL ADDITION (required for analytics admin gate)
 * ---------------------------------------------------------
 * Add a `role` field to your existing User schema if it doesn't have one:
 *
 *   role: { type: String, enum: ['user', 'admin'], default: 'user' }
 *
 * Then manually set at least one user's role to 'admin' in MongoDB to
 * access the /api/analytics/admin/* endpoints.
 */

/**
 * ITINERARY MODEL ADDITIONS (optional, recommended)
 * ---------------------------------------------------
 * If not already present, add these fields to support the new features:
 *
 *   saved:    { type: Boolean, default: false }   // used by analytics funnel
 *   tripType: { type: String, default: 'general' } // used by packing list generator
 */
