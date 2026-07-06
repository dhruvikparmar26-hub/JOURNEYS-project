import { Router } from 'express';
import { z } from 'zod';
import TripRequest from '../models/TripRequest.js';

const router = Router();

// Zod payload validation schema
const tripRequestInputSchema = z.object({
  origin: z.object({
    lat: z.number({ required_error: 'Origin latitude is required' }),
    lng: z.number({ required_error: 'Origin longitude is required' }),
    label: z.string({ required_error: 'Origin label is required' }).min(1, 'Origin cannot be empty'),
  }),
  destination: z.object({
    lat: z.number({ required_error: 'Destination latitude is required' }),
    lng: z.number({ required_error: 'Destination longitude is required' }),
    label: z.string({ required_error: 'Destination label is required' }).min(1, 'Destination cannot be empty'),
    placeId: z.string().optional().default(''),
  }),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  budgetMin: z.number().min(0, 'Minimum budget must be positive'),
  budgetMax: z.number().min(0, 'Maximum budget must be positive'),
});

/**
 * POST /api/trip-requests
 * Saves a new trip request submitted by an anonymous guest or logged-in user.
 * Authenticated calls save to userId; unauthenticated calls save to guestId.
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validation = tripRequestInputSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.format(),
      });
    }

    const { origin, destination, startDate, endDate, budgetMin, budgetMax } = validation.data;

    // Check date logic
    if (startDate > endDate) {
      return res.status(400).json({ error: 'Start date must be before or on the end date' });
    }

    // Determine ownership: prioritize authenticated userId, fallback to guestId
    const userId = req.user?._id || null;
    const guestId = userId ? null : (req.guestId || null);

    if (!userId && !guestId) {
      return res.status(400).json({ error: 'Session correlation ID is missing. Refresh page.' });
    }

    // Create and save request parameters
    const tripRequest = await TripRequest.create({
      userId,
      guestId,
      origin,
      destination,
      startDate,
      endDate,
      budgetMin,
      budgetMax,
    });

    return res.status(201).json({
      message: 'Trip request recorded successfully',
      tripRequest,
    });
  } catch (error) {
    console.error('Trip request submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
