import express from 'express';
import { z } from 'zod';
import PriceAlert from '../models/PriceAlert.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

const placeSchema = z.object({
  label: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const alertSchema = z.object({
  origin: placeSchema,
  destination: placeSchema,
  mode: z.enum(['cab', 'bus', 'train', 'flight', 'all']).optional(),
  thresholdAmount: z.number().min(0),
  currency: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

/**
 * POST /api/price-alerts
 * Flow:
 *   requireAuth -> validate body -> create PriceAlert (status = active)
 *   -> a background job (jobs/priceAlertChecker.js) will re-quote routes
 *      periodically and notify the user when price <= threshold.
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = alertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const alert = await PriceAlert.create({
      user: req.user.id,
      ...parsed.data,
    });
    return res.status(201).json({ alert });
  } catch (err) {
    console.error('POST /price-alerts error:', err);
    return res.status(500).json({ error: 'Failed to create price alert' });
  }
});

/**
 * GET /api/price-alerts
 * requireAuth -> list all alerts belonging to the user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const alerts = await PriceAlert.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json({ alerts });
  } catch (err) {
    console.error('GET /price-alerts error:', err);
    return res.status(500).json({ error: 'Failed to fetch price alerts' });
  }
});

/**
 * PATCH /api/price-alerts/:id
 * requireAuth -> owner only -> update threshold, pause/resume, etc.
 */
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const alert = await PriceAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    if (String(alert.user) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not your alert' });
    }

    const patchSchema = z.object({
      thresholdAmount: z.number().min(0).optional(),
      status: z.enum(['active', 'paused']).optional(),
      expiresAt: z.string().datetime().optional(),
    });
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    Object.assign(alert, parsed.data);
    await alert.save();
    return res.json({ alert });
  } catch (err) {
    console.error('PATCH /price-alerts/:id error:', err);
    return res.status(500).json({ error: 'Failed to update alert' });
  }
});

/**
 * DELETE /api/price-alerts/:id
 * requireAuth -> owner only
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const alert = await PriceAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    if (String(alert.user) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not your alert' });
    }
    await alert.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /price-alerts/:id error:', err);
    return res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
