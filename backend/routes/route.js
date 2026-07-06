import { Router } from 'express';
import { findMajorRoute, getRouteMatrix, estimateCosts } from '../services/routing.js';

const router = Router();

/**
 * GET /api/route?origin=JSON&destination=JSON&mode=all
 *
 * Returns distance, duration, and cost estimates for all transport modes.
 * Public endpoint — no auth required. Rate-limited by guestId via the
 * generationRateLimiter (mounted in server.js).
 *
 * Query params:
 *   origin      — JSON string { lat, lng, label }
 *   destination — JSON string { lat, lng, label }
 *   mode        — 'cab' | 'bus' | 'train' | 'flight' | 'all' (default: 'all')
 */
router.get('/', async (req, res) => {
  try {
    const { origin: originStr, destination: destStr, mode = 'all' } = req.query;

    if (!originStr || !destStr) {
      return res.status(400).json({
        error: 'Both origin and destination query parameters are required',
        usage: 'GET /api/route?origin={"lat":28.61,"lng":77.20,"label":"Delhi"}&destination={"lat":19.07,"lng":72.87,"label":"Mumbai"}',
      });
    }

    // Parse JSON query params
    let origin, destination;
    try {
      origin = JSON.parse(originStr);
      destination = JSON.parse(destStr);
    } catch (parseErr) {
      return res.status(400).json({
        error: 'Invalid JSON in origin or destination parameter',
        details: parseErr.message,
      });
    }

    // Validate required fields
    if (!origin.label || !destination.label) {
      return res.status(400).json({
        error: 'Origin and destination must include a "label" field',
      });
    }

    // 1. Check major routes cache first (instant, no API call)
    const majorRoute = findMajorRoute(origin.label, destination.label);

    let distanceKm, durationSeconds, source;

    if (majorRoute) {
      distanceKm = majorRoute.distanceKm;
      durationSeconds = Math.round((distanceKm / 60) * 3600); // estimated at ~60km/h
      source = majorRoute.source;
    } else {
      // 2. Need coordinates for live/cached route calculation
      if (origin.lat == null || origin.lng == null || destination.lat == null || destination.lng == null) {
        return res.status(400).json({
          error: 'Coordinates (lat, lng) are required when the route is not in the pre-cached corridor list',
        });
      }

      const routeResult = await getRouteMatrix(origin, destination);
      distanceKm = routeResult.distanceKm;
      durationSeconds = routeResult.durationSeconds;
      source = routeResult.source;
    }

    // 3. Compute cost breakdown
    const validModes = ['cab', 'bus', 'train', 'flight', 'all'];
    const selectedMode = validModes.includes(mode) ? mode : 'all';
    const costs = estimateCosts(distanceKm, selectedMode);

    // 4. Format duration as human-readable
    const hours = Math.floor(durationSeconds / 3600);
    const mins = Math.round((durationSeconds % 3600) / 60);
    const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return res.status(200).json({
      route: {
        origin: origin.label,
        destination: destination.label,
        distanceKm,
        durationSeconds,
        durationFormatted,
        source,
      },
      costs,
    });
  } catch (error) {
    console.error('Route calculation error:', error);
    return res.status(500).json({ error: 'Route calculation failed' });
  }
});

export default router;
