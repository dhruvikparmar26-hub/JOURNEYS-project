import { Router } from 'express';

const router = Router();

/**
 * GET /api/config
 * Exposes non-sensitive configuration parameters (like Google Maps API key)
 * to the frontend, avoiding the need to hardcode keys in static assets.
 */
router.get('/', (req, res) => {
  const browserKey = process.env.GOOGLE_MAPS_BROWSER_KEY ||
    (process.env.NODE_ENV === 'production' ? '' : process.env.GOOGLE_MAPS_API_KEY);

  return res.status(200).json({
    googleMapsApiKey: browserKey || '',
  });
});

export default router;
