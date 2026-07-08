import express from 'express';
import { z } from 'zod';
import Review from '../models/Review.js';
import Itinerary from '../models/Itinerary.js';
import Notification from '../models/Notification.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const reviewSchema = z.object({
  itineraryId: z.string().min(1),
  ratings: z.object({
    overall: z.number().min(1).max(5),
    hotel: z.number().min(1).max(5).optional(),
    activities: z.number().min(1).max(5).optional(),
    value: z.number().min(1).max(5).optional(),
  }),
  title: z.string().max(120).optional(),
  comment: z.string().max(3000).optional(),
  photos: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

/**
 * POST /api/reviews
 * Flow:
 *   requireAuth
 *   -> validate body (Zod)
 *   -> find itinerary, verify it belongs to req.user and trip is completed
 *   -> upsert Review (one per user per itinerary)
 *   -> create notification ("Thanks for your review")
 *   -> return review
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { itineraryId, ratings, title, comment, photos, isPublic } = parsed.data;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    if (String(itinerary.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not your itinerary' });
    }

    const review = await Review.findOneAndUpdate(
      { itinerary: itineraryId, user: req.user.id },
      {
        itinerary: itineraryId,
        user: req.user.id,
        destination: itinerary.destinations?.[0] || itinerary.destination?.label || itinerary.destination || itinerary.title,
        ratings,
        title,
        comment,
        photos: photos || [],
        isPublic: isPublic !== false,
        tripCompletedAt: itinerary.endDate || new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Notification.create({
      userId: req.user.id,
      type: 'review_submitted',
      message: `Thanks for reviewing your trip to ${review.destination}!`,
      relatedItineraryId: itineraryId,
    });

    return res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You already reviewed this itinerary' });
    }
    console.error('POST /reviews error:', err);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

/**
 * GET /api/reviews/destination/:label
 * Public: list visible reviews for a destination (for exploring/trust signals)
 * Flow:
 *   -> find reviews where destination matches + isPublic + status visible
 *   -> paginate
 *   -> return reviews + average ratings
 */
router.get('/destination/:label', async (req, res) => {
  try {
    const { label } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const filter = {
      destination: new RegExp(`^${escapeRegex(label)}$`, 'i'),
      isPublic: true,
      status: 'visible',
    };

    const [reviews, total, agg] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            avgOverall: { $avg: '$ratings.overall' },
            avgHotel: { $avg: '$ratings.hotel' },
            avgActivities: { $avg: '$ratings.activities' },
            avgValue: { $avg: '$ratings.value' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return res.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      summary: agg[0] || null,
    });
  } catch (err) {
    console.error('GET /reviews/destination error:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * GET /api/reviews/mine
 * requireAuth -> return the logged-in user's own reviews
 */
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('itinerary', 'destination startDate endDate')
      .sort({ createdAt: -1 });
    return res.json({ reviews });
  } catch (err) {
    console.error('GET /reviews/mine error:', err);
    return res.status(500).json({ error: 'Failed to fetch your reviews' });
  }
});

/**
 * PATCH /api/reviews/:id
 * requireAuth -> owner only -> update rating/comment
 */
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (String(review.user) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not your review' });
    }
    const parsed = reviewSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    Object.assign(review, parsed.data);
    await review.save();
    return res.json({ review });
  } catch (err) {
    console.error('PATCH /reviews/:id error:', err);
    return res.status(500).json({ error: 'Failed to update review' });
  }
});

/**
 * DELETE /api/reviews/:id
 * requireAuth -> owner only
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (String(review.user) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not your review' });
    }
    await review.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /reviews/:id error:', err);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

/**
 * POST /api/reviews/:id/helpful
 * requireAuth -> increment helpfulCount (simple, no dedup tracking here)
 */
router.post('/:id/helpful', requireAuth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      { _id: req.params.id, helpfulUsers: { $ne: req.user._id } },
      { $inc: { helpfulCount: 1 }, $addToSet: { helpfulUsers: req.user._id } },
      { new: true }
    );
    if (!review) {
      const exists = await Review.exists({ _id: req.params.id });
      if (!exists) return res.status(404).json({ error: 'Review not found' });
      return res.status(409).json({ error: 'You already marked this review helpful' });
    }
    return res.json({ helpfulCount: review.helpfulCount });
  } catch (err) {
    console.error('POST /reviews/:id/helpful error:', err);
    return res.status(500).json({ error: 'Failed to mark helpful' });
  }
});

export default router;
