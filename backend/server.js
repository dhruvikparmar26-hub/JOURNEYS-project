import './config/loadEnv.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import connectDB from './config/db.js';
import { validateEnv } from './config/env.js';
import { applySecurityMiddleware } from './middleware/security.js';
import { apiRateLimiter, generationRateLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import tripRequestRoutes from './routes/tripRequest.js';
import routeRoutes from './routes/route.js';
import itineraryRoutes from './routes/itineraries.js';
import notificationRoutes from './routes/notifications.js';
import waitlistRoutes from './routes/waitlist.js';
import reviewsRoutes from './routes/reviews.js';
import wishlistRoutes from './routes/wishlist.js';
import priceAlertsRoutes from './routes/priceAlerts.js';
import groupTripsRoutes from './routes/groupTrips.js';
import packingListRoutes from './routes/packingList.js';
import analyticsRoutes from './routes/analytics.js';
import profileRoutes from './routes/profile.js';
import supportRoutes from './routes/support.js';
import couponsRoutes from './routes/coupons.js';
import chatRoutes from './routes/chat.js';
import destinationsRoutes from './routes/destinations.js';
import User from './models/User.js';
import guestSession from './middleware/guestSession.js';
import { seedDB } from './utils/seedData.js';
import { startPriceAlertScheduler } from './jobs/priceAlertChecker.js';

// Validate environment variables (loaded via loadEnv.js)
validateEnv();

const app = express();
const PORT = process.env.PORT || 5050;

// ─── Security Middleware ─────────────────────────────────────

applySecurityMiddleware(app);

// ─── Body Parsing ────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(guestSession);

// ─── Global Rate Limiting ────────────────────────────────────

app.use('/api', apiRateLimiter);

// ─── Passport (Google OAuth) ────────────────────────────────

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID || 'not-configured',
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || 'not-configured',
      callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL || 'http://localhost:5050/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find existing user by Google ID or email
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails?.[0]?.value },
          ],
        });

        if (user) {
          // Link Google account if not already linked
          if (!user.googleId) {
            user.googleId = profile.id;
            user.emailVerified = true;
            if (!user.name && profile.displayName) {
              user.name = profile.displayName;
            }
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          email: profile.emails?.[0]?.value,
          googleId: profile.id,
          name: profile.displayName || '',
          avatar: profile.photos?.[0]?.value || null,
          emailVerified: true, // Google already verified the email
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

app.use(passport.initialize());

// ─── Routes ──────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'JOURNEYS API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Configuration routes
app.use('/api/config', configRoutes);

// Trip requests
app.use('/api/trip-requests', tripRequestRoutes);

// Route calculation (public, rate-limited per guestId)
app.use('/api/route', generationRateLimiter, routeRoutes);

// Itineraries; generation endpoint applies its own stricter limiter.
app.use('/api/itineraries', itineraryRoutes);

// Notifications (authenticated only)
app.use('/api/notifications', notificationRoutes);

// Waitlist (public)
app.use('/api/waitlist', waitlistRoutes);

// Reviews and ratings
app.use('/api/reviews', reviewsRoutes);

// Wishlist / saved destinations
app.use('/api/wishlist', wishlistRoutes);

// Price alerts
app.use('/api/price-alerts', priceAlertsRoutes);

// Group trips
app.use('/api/group-trips', groupTripsRoutes);

// Packing lists
app.use('/api/packing-list', packingListRoutes);

// Analytics
app.use('/api/analytics', analyticsRoutes);

// User Profiles
app.use('/api/profile', profileRoutes);

// Customer Support
app.use('/api/support', supportRoutes);

// Coupons Management
app.use('/api/coupons', couponsRoutes);

// AI Travel Chat
app.use('/api/chat', chatRoutes);

// Destinations Metadata
app.use('/api/destinations', destinationsRoutes);

// ─── 404 Handler ─────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
  });
});

// ─── Global Error Handler ────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ─── Start Server ────────────────────────────────────────────

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Seed Database with initial featured destinations & coupon codes
    await seedDB();

    startPriceAlertScheduler();

    app.listen(PORT, () => {
      console.log(`\n🚀 JOURNEYS API running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
