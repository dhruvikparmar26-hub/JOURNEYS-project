import express from 'express';
import PackingList from '../models/PackingList.js';
import Itinerary from '../models/Itinerary.js';
import { generateAIPackingList } from '../services/packingListGenerator.js';
import optionalAuth from '../middleware/optionalAuth.js';
import guestSession from '../middleware/guestSession.js';
import { canAccessOwnedDocument } from '../utils/ownership.js';

const router = express.Router();

/**
 * Helper: derive a rough season from a date (Northern-hemisphere / India
 * seasonal buckets - adjust for your target region).
 */
function seasonFromDate(date) {
  if (!date) return undefined;
  const month = new Date(date).getMonth() + 1; // 1-12
  if ([12, 1, 2].includes(month)) return 'winter';
  if ([3, 4, 5].includes(month)) return 'summer';
  if ([6, 7, 8, 9].includes(month)) return 'monsoon';
  return 'autumn';
}

/**
 * GET /api/packing-list/:itineraryId
 * Flow:
 *   -> find itinerary (public data - no auth required, matches your
 *      GET /api/itineraries/:id pattern of guest+user access)
 *   -> check PackingList cache first
 *   -> if not cached: derive season from itinerary.startDate,
 *      trip type from query (?tripType=) or itinerary metadata
 *   -> call generateAIPackingList (AI if configured, else rules)
 *   -> cache result in PackingList collection
 *   -> return categories + travelTips
 */
router.get('/:itineraryId', optionalAuth, guestSession, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.itineraryId);
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
    if (!canAccessOwnedDocument(req, itinerary)) {
      return res.status(403).json({ error: 'You do not have access to this itinerary' });
    }

    let cached = await PackingList.findOne({ itinerary: itinerary._id });
    if (cached) {
      return res.json({ packingList: cached, cached: true });
    }

    const destinationLabel =
      itinerary.destinations?.[0] || itinerary.destination?.label || itinerary.destination || itinerary.title;
    const season = seasonFromDate(itinerary.tripStartDate || itinerary.startDate);
    const tripType = req.query.tripType || itinerary.tripType || 'general';
    const days =
      itinerary.tripStartDate && itinerary.tripEndDate
        ? Math.max(
            1,
            Math.round(
              (new Date(itinerary.tripEndDate) - new Date(itinerary.tripStartDate)) /
                (1000 * 60 * 60 * 24)
            )
          )
        : undefined;

    const generated = await generateAIPackingList({
      destination: destinationLabel,
      season,
      tripType,
      days,
    });

    cached = await PackingList.create({
      itinerary: itinerary._id,
      destination: destinationLabel,
      season,
      tripType,
      categories: generated.categories,
      travelTips: generated.travelTips,
      generatedBy: generated.generatedBy,
    });

    return res.status(201).json({ packingList: cached, cached: false });
  } catch (err) {
    console.error('GET /packing-list/:id error:', err);
    return res.status(500).json({ error: 'Failed to generate packing list' });
  }
});

/**
 * POST /api/packing-list/:itineraryId/regenerate
 * Flow: same as above but forces a fresh generation (e.g. user changed
 * trip type or wants a different tone). Overwrites the cached document.
 */
router.post('/:itineraryId/regenerate', optionalAuth, guestSession, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.itineraryId);
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
    if (!canAccessOwnedDocument(req, itinerary)) {
      return res.status(403).json({ error: 'You do not have access to this itinerary' });
    }

    const destinationLabel =
      itinerary.destinations?.[0] || itinerary.destination?.label || itinerary.destination || itinerary.title;
    const season = seasonFromDate(itinerary.tripStartDate || itinerary.startDate);
    const tripType = req.body.tripType || itinerary.tripType || 'general';

    const generated = await generateAIPackingList({
      destination: destinationLabel,
      season,
      tripType,
    });

    const packingList = await PackingList.findOneAndUpdate(
      { itinerary: itinerary._id },
      {
        destination: destinationLabel,
        season,
        tripType,
        categories: generated.categories,
        travelTips: generated.travelTips,
        generatedBy: generated.generatedBy,
      },
      { upsert: true, new: true }
    );

    return res.json({ packingList });
  } catch (err) {
    console.error('POST /packing-list/:id/regenerate error:', err);
    return res.status(500).json({ error: 'Failed to regenerate packing list' });
  }
});

/**
 * PUT /api/packing-list/:itineraryId
 * Saves checkbox selection states in database
 */
router.put('/:itineraryId', optionalAuth, guestSession, async (req, res) => {
  try {
    const { categories } = req.body;
    const packingList = await PackingList.findOneAndUpdate(
      { itinerary: req.params.itineraryId },
      { categories },
      { new: true }
    );
    if (!packingList) return res.status(404).json({ error: 'Packing list not found' });
    return res.json({ success: true, packingList });
  } catch (err) {
    console.error('PUT /packing-list/:id error:', err);
    return res.status(500).json({ error: 'Failed to update packing list' });
  }
});

export default router;
