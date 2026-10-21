import { Router } from 'express';
import { runOrchestrator } from '../agents/orchestrator.js';
import Itinerary from '../models/Itinerary.js';
import TripRequest from '../models/TripRequest.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import { generationRateLimiter } from '../middleware/rateLimiter.js';
import requireAuth from '../middleware/requireAuth.js';
import requireVerifiedEmail from '../middleware/requireVerifiedEmail.js';
import guestSession from '../middleware/guestSession.js';
import optionalAuth from '../middleware/optionalAuth.js';
import { canAccessOwnedDocument, getOwnerFields, getUserId } from '../utils/ownership.js';

const router = Router();

// In-memory store for active itinerary generations (for SSE streaming)
// In production, this should be Redis or similar
const activeGenerations = new Map();

/**
 * POST /api/itineraries
 *
 * Starts the itinerary generation process using the LangGraph orchestrator.
 * Open to guests (rate-limited per guestId) and authenticated users.
 * 
 * Request body:
 * {
 *   origin: { lat, lng, label },
 *   destination: { lat, lng, label },
 *   startDate: ISO date string,
 *   endDate: ISO date string,
 *   budgetMin: number,
 *   budgetMax: number
 * }
 */
router.post('/', optionalAuth, generationRateLimiter, guestSession, async (req, res) => {
  try {
    const { origin, destination, startDate, endDate, budgetMin, budgetMax, vehicleType } = req.body;

    // Validate required fields
    if (!origin || !destination || !startDate || !endDate || budgetMin == null || budgetMax == null) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['origin', 'destination', 'startDate', 'endDate', 'budgetMin', 'budgetMax'],
      });
    }

    // Validate origin and destination structure
    if (origin.lat == null || origin.lng == null || !origin.label) {
      return res.status(400).json({
        error: 'Invalid origin: must include lat, lng, and label',
      });
    }

    if (destination.lat == null || destination.lng == null || !destination.label) {
      return res.status(400).json({
        error: 'Invalid destination: must include lat, lng, and label',
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
      });
    }

    if (end < start) {
      return res.status(400).json({
        error: 'End date must be after start date',
      });
    }

    // Validate budget
    if (budgetMin < 0 || budgetMax < 0) {
      return res.status(400).json({
        error: 'Budget values cannot be negative',
      });
    }

    if (budgetMax < budgetMin) {
      return res.status(400).json({
        error: 'Maximum budget must be greater than or equal to minimum budget',
      });
    }

    // Determine owner (userId or guestId)
    const ownerId = getOwnerFields(req);

    // Create TripRequest record
    const tripRequest = await TripRequest.create({
      ...ownerId,
      origin,
      destination,
      startDate: start,
      endDate: end,
      budgetMin,
      budgetMax,
    });

    // Create Itinerary record with 'generating' status
    const itinerary = await Itinerary.create({
      ...ownerId,
      title: `${destination.label} Trip`,
      destinations: [destination.label],
      status: 'generating',
      totalCost: 0,
      durationDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
      tripStartDate: start,
      tripEndDate: end,
      prompt: JSON.stringify({ origin, destination, startDate, endDate, budgetMin, budgetMax, vehicleType }),
    });

    const itineraryId = itinerary._id.toString();

    // Initialize log array in activeGenerations for SSE streaming
    activeGenerations.set(itineraryId, {
      log: [],
      status: 'generating',
      itinerary: null,
      ownerId,
    });

    setTimeout(() => {
      activeGenerations.delete(itineraryId);
    }, 30 * 60 * 1000);

    // Start the orchestrator in the background
    runOrchestrator(
      {
        origin,
        destination,
        startDate,
        endDate,
        budgetMin,
        budgetMax,
      },
      ownerId
    ).then(async (result) => {
      if (!result || !result.itinerary) {
        throw new Error(result?.error || 'Orchestrator did not return a valid itinerary');
      }

      // Update the activeGenerations with the final result
      const generation = activeGenerations.get(itineraryId);
      if (generation) {
        generation.log = result.log || [];
        generation.status = 'completed';
        generation.itinerary = result.itinerary;
      }

      try {
        const distance = result.itinerary.route?.distanceKm || 0;
        let chosenMode = 'car';
        let chosenCost = result.itinerary.route?.costs?.cab?.estimated || 0;
        let chosenDuration = result.itinerary.route?.durationSeconds 
          ? Math.round(result.itinerary.route.durationSeconds / 60) 
          : 240;

        if (vehicleType) {
          const vt = vehicleType.toLowerCase();
          if (vt === 'plane' || vt === 'flight') {
            chosenMode = 'flight';
            chosenCost = Math.round(distance * 8 + 2000);
            chosenDuration = Math.round((distance / 700) * 60) + 60;
          } else if (vt === 'bus') {
            chosenMode = 'bus';
            chosenCost = Math.round(distance * 3);
            chosenDuration = Math.round((distance / 50) * 60);
          } else if (vt === 'bike') {
            chosenMode = 'bike';
            chosenCost = Math.round(distance * 1.5);
            chosenDuration = Math.round((distance / 40) * 60);
          } else if (vt === 'car') {
            chosenMode = 'car';
            chosenCost = Math.round(distance * 10);
            chosenDuration = Math.round((distance / 70) * 60);
          }
        } else {
          if (distance > 500) {
            if (result.itinerary.route?.costs?.flight?.estimated) {
              chosenMode = 'flight';
              chosenCost = result.itinerary.route.costs.flight.estimated;
              chosenDuration = Math.round(distance / 700 * 60) + 60;
            } else if (result.itinerary.route?.costs?.train?.ac3?.estimated) {
              chosenMode = 'train';
              chosenCost = result.itinerary.route.costs.train.ac3.estimated;
              chosenDuration = Math.round(distance / 60 * 60);
            }
          } else if (distance > 250) {
            if (result.itinerary.route?.costs?.train?.ac3?.estimated) {
              chosenMode = 'train';
              chosenCost = result.itinerary.route.costs.train.ac3.estimated;
              chosenDuration = Math.round(distance / 60 * 60);
            }
          }
        }

        const days = result.itinerary.dailyPlan.map((day, index) => {
          const isDepartureDay = index === 0;
          const isReturnDay = index === result.itinerary.dailyPlan.length - 1;

          const dayLocations = [];
          if (result.itinerary.recommendedHotel?.location) {
            dayLocations.push({
              name: result.itinerary.recommendedHotel.name,
              lat: result.itinerary.recommendedHotel.location.lat,
              lng: result.itinerary.recommendedHotel.location.lng,
              type: 'hotel',
              notes: result.itinerary.recommendedHotel.description || '',
            });
          }
          day.activities.forEach((act) => {
            if (act.lat && act.lng) {
              dayLocations.push({
                name: act.name,
                lat: act.lat,
                lng: act.lng,
                type: 'attraction',
                notes: act.type || '',
              });
            }
          });

          return {
            dayNumber: day.dayNumber,
            title: `Day ${day.dayNumber}`,
            locations: dayLocations,
            activities: day.activities.map((activity) => ({
              time: activity.time,
              description: `${activity.name} (${activity.type})`,
              cost: activity.cost || 0,
              currency: 'INR',
              lat: activity.lat,
              lng: activity.lng,
            })),
            travelSegments: (isDepartureDay && result.itinerary.route)
              ? [
                  {
                    from: (chosenMode === 'flight' && result.itinerary.route.airports)
                      ? `${result.itinerary.route.airports.origin.name} (${result.itinerary.route.airports.origin.iata})`
                      : origin.label,
                    to: (chosenMode === 'flight' && result.itinerary.route.airports)
                      ? `${result.itinerary.route.airports.destination.name} (${result.itinerary.route.airports.destination.iata})`
                      : destination.label,
                    mode: chosenMode,
                    distanceKm: distance,
                    durationMinutes: chosenDuration,
                    cost: chosenCost,
                  },
                ]
              : (isReturnDay && result.itinerary.route)
              ? [
                  {
                    from: (chosenMode === 'flight' && result.itinerary.route.airports)
                      ? `${result.itinerary.route.airports.destination.name} (${result.itinerary.route.airports.destination.iata})`
                      : destination.label,
                    to: (chosenMode === 'flight' && result.itinerary.route.airports)
                      ? `${result.itinerary.route.airports.origin.name} (${result.itinerary.route.airports.origin.iata})`
                      : origin.label,
                    mode: chosenMode,
                    distanceKm: distance,
                    durationMinutes: chosenDuration,
                    cost: chosenCost,
                  },
                ]
              : [],
            dayCost: day.activities.reduce((sum, act) => sum + (act.cost || 0), 0) + 
              ((isDepartureDay || isReturnDay) ? chosenCost : 0),
          };
        });

        // Compute updated total cost including accommodation and activities
        const hotelCostPerNight = result.itinerary.recommendedHotel?.price || 0;
        const totalDays = result.itinerary.dailyPlan.length;
        const hotelNights = Math.max(0, totalDays - 1);
        const activitiesCostSum = days.reduce((sum, d) => sum + d.activities.reduce((aSum, a) => aSum + (a.cost || 0), 0), 0);
        const transitCostSum = 2 * chosenCost;
        const recalculatedTotalCost = activitiesCostSum + transitCostSum + (hotelCostPerNight * hotelNights);

        await Itinerary.findByIdAndUpdate(itineraryId, {
          status: 'generated',
          totalCost: isNaN(recalculatedTotalCost) ? 0 : recalculatedTotalCost,
          generatedAt: new Date(),
          days,
        });

        // Emit notification for itinerary ready (only for authenticated users)
        if (ownerId.userId) {
          await Notification.create({
            userId: ownerId.userId,
            type: 'itinerary_ready',
            message: `Your itinerary from ${origin.label} to ${destination.label} is ready!`,
            relatedItineraryId: itineraryId,
          });
        }
      } catch (error) {
        console.error('Error updating itinerary:', error);
        
        // Mark as failed if there was an error
        const generation = activeGenerations.get(itineraryId);
        if (generation) {
          generation.status = 'failed';
          generation.error = error.message;
        }

        await Itinerary.findByIdAndUpdate(itineraryId, {
          status: 'failed',
        });
      }
    }).catch(async (error) => {
      console.error('Orchestrator error:', error);
      
      // Mark as failed
      const generation = activeGenerations.get(itineraryId);
      if (generation) {
        generation.status = 'failed';
        generation.error = error.message;
      }

      await Itinerary.findByIdAndUpdate(itineraryId, {
        status: 'failed',
      });
    });

    // Return immediately with the itinerary ID
    res.status(202).json({
      message: 'Itinerary generation started',
      itineraryId,
      streamUrl: `/api/itineraries/${itineraryId}/stream`,
    });
  } catch (error) {
    console.error('Itinerary creation error:', error);
    res.status(500).json({
      error: 'Failed to start itinerary generation',
      details: error.message,
    });
  }
});

/**
 * GET /api/itineraries/:id/stream
 *
 * Server-Sent Events endpoint for streaming real-time logs
 * from the orchestrator as it runs. Open to all - no auth required
 * to watch your own in-progress generation.
 */
router.get('/:id/stream', optionalAuth, guestSession, async (req, res) => {
  const itineraryId = req.params.id;

  // Check if the generation exists
  const generation = activeGenerations.get(itineraryId);

  const canAccessGeneration = (ownerId) => {
    const userId = getUserId(req);
    if (userId && ownerId?.userId?.toString() === userId) return true;
    return Boolean(!userId && req.guestId && ownerId?.guestId === req.guestId);
  };
  
  if (!generation) {
    // If not found, check if it's already completed in the database
    try {
      const itinerary = await Itinerary.findById(itineraryId);
      if (!itinerary) {
        return res.status(404).json({ error: 'Itinerary not found' });
      }

      if (!canAccessOwnedDocument(req, itinerary)) {
        return res.status(403).json({ error: 'You do not have access to this itinerary' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (itinerary.status === 'generated') {
        res.write(`data: ${JSON.stringify({ status: 'completed', message: 'Itinerary already generated' })}\n\n`);
        res.end();
        return;
      }

      // If it exists but not in activeGenerations, it might have been cleaned up
      res.write(`data: ${JSON.stringify({ error: 'Generation data not available (may have been cleaned up)' })}\n\n`);
      res.end();
      return;
    } catch (error) {
      return res.status(500).json({ error: 'Failed to check itinerary status' });
    }
  }

  if (!canAccessGeneration(generation.ownerId)) {
    return res.status(403).json({ error: 'You do not have access to this itinerary stream' });
  }

  // Set SSE headers after authorization succeeds.
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send existing logs if any
  if (generation.log && generation.log.length > 0) {
    generation.log.forEach((logEntry) => {
      res.write(`data: ${JSON.stringify({ type: 'log', ...logEntry })}\n\n`);
    });
  }

  // Send current status
  res.write(`data: ${JSON.stringify({ type: 'status', status: generation.status })}\n\n`);

  let lastLogIndex = generation.log?.length || 0;

  const pollInterval = setInterval(() => {
    const currentGeneration = activeGenerations.get(itineraryId);
    
    if (!currentGeneration) {
      clearInterval(pollInterval);
      res.write(`data: ${JSON.stringify({ type: 'status', status: 'completed' })}\n\n`);
      res.end();
      return;
    }

    // Send new logs since last poll
    if (currentGeneration.log && currentGeneration.log.length > 0) {
      const newLogs = currentGeneration.log.slice(lastLogIndex);
      
      newLogs.forEach((logEntry) => {
        res.write(`data: ${JSON.stringify({ type: 'log', ...logEntry })}\n\n`);
      });
      
      lastLogIndex = currentGeneration.log.length;
    }

    // Check if completed
    if (currentGeneration.status === 'completed') {
      clearInterval(pollInterval);
      res.write(`data: ${JSON.stringify({ type: 'status', status: 'completed' })}\n\n`);
      
      // Send final itinerary
      if (currentGeneration.itinerary) {
        res.write(`data: ${JSON.stringify({ type: 'result', itinerary: currentGeneration.itinerary })}\n\n`);
      }
      
      res.end();
      
      // Clean up after a delay
      setTimeout(() => {
        activeGenerations.delete(itineraryId);
      }, 5 * 60 * 1000); // 5 minutes
    } else if (currentGeneration.status === 'failed') {
      clearInterval(pollInterval);
      res.write(`data: ${JSON.stringify({ type: 'status', status: 'failed', error: currentGeneration.error })}\n\n`);
      res.end();
      
      // Clean up
      activeGenerations.delete(itineraryId);
    }
  }, 500); // Poll every 500ms

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(pollInterval);
  });
});

/**
 * GET /api/itineraries/:id
 *
 * Retrieve a completed itinerary by ID.
 * Open to guests (if they own it) and authenticated users.
 * Ownership verification: must match either req.guestId OR req.user.id
 */
router.get('/:id', optionalAuth, guestSession, async (req, res) => {
  try {
    const itineraryId = req.params.id;
    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    if (!canAccessOwnedDocument(req, itinerary)) {
      return res.status(403).json({ error: 'You do not have access to this itinerary' });
    }

    res.status(200).json(itinerary);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
});

/**
 * POST /api/itineraries/:id/save
 *
 * Save/bookmark an itinerary to the authenticated user's account.
 * Requires authentication.
 */
router.post('/:id/save', requireAuth, async (req, res) => {
  try {
    const itineraryId = req.params.id;
    const userId = req.user.id;

    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // If itinerary belongs to a guest, transfer ownership to the user
    if (itinerary.guestId && !itinerary.userId) {
      itinerary.userId = userId;
      itinerary.guestId = null;
      itinerary.status = 'saved';
      await itinerary.save();
    } 
    // If itinerary already belongs to this user, just mark as saved
    else if (itinerary.userId && itinerary.userId.toString() === userId.toString()) {
      itinerary.status = 'saved';
      await itinerary.save();
    }
    // If itinerary belongs to another user, deny access
    else {
      return res.status(403).json({ error: 'You cannot save an itinerary that belongs to another user' });
    }

    // Emit notification for saved itinerary
    await Notification.create({
      userId: req.user.id,
      type: 'itinerary_saved',
      message: `Your itinerary "${itinerary.destinations?.join(', ') || itinerary.title}" has been saved.`,
      relatedItineraryId: itinerary._id,
    });

    res.status(200).json({
      message: 'Itinerary saved successfully',
      itinerary,
    });
  } catch (error) {
    console.error('Error saving itinerary:', error);
    res.status(500).json({ error: 'Failed to save itinerary' });
  }
});

/**
 * POST /api/bookings
 *
 * Create a booking for an item (hotel, activity, transport, etc.).
 * Requires authentication AND verified email (only endpoint that requires verification).
 */
router.post('/bookings', requireAuth, requireVerifiedEmail, async (req, res) => {
  try {
    const { itineraryId, itemName, itemType, bookingDate, quantity, price, currency, metadata } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!itineraryId || !itemName || !itemType || !bookingDate || !price) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['itineraryId', 'itemName', 'itemType', 'bookingDate', 'price'],
      });
    }

    // Verify the user has access to this itinerary
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    if (!itinerary.userId || itinerary.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only book items from your own itineraries' });
    }

    // Calculate total amount
    const totalAmount = price * (quantity || 1);

    // Create booking
    const booking = await Booking.create({
      userId,
      itineraryId,
      itemName,
      itemType,
      bookingDate: new Date(bookingDate),
      quantity: quantity || 1,
      price,
      currency: currency || 'INR',
      totalAmount,
      metadata: metadata || {},
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });

    // Emit notification for booking confirmed
    await Notification.create({
      userId: req.user.id,
      type: 'booking_confirmed',
      message: `Your booking for "${itemName}" has been confirmed.`,
      relatedItineraryId: itineraryId,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

/**
 * POST /api/itineraries/:id/share
 *
 * Generate or retrieve share token for an itinerary.
 * Requires authentication and ownership.
 */
router.post('/:id/share', requireAuth, async (req, res) => {
  try {
    const itineraryId = req.params.id;
    const userId = req.user.id;

    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Verify ownership
    if (!itinerary.userId || itinerary.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You can only share your own itineraries' });
    }

    // Generate share token if not exists
    if (!itinerary.shareToken) {
      const crypto = await import('crypto');
      itinerary.shareToken = crypto.randomBytes(32).toString('hex');
      itinerary.isPublic = true;
      await itinerary.save();
    }

    // Ensure isPublic is true
    if (!itinerary.isPublic) {
      itinerary.isPublic = true;
      await itinerary.save();
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5180';
    const shareUrl = `${frontendUrl}/shared/${itinerary.shareToken}`;

    res.status(200).json({
      shareUrl,
      shareToken: itinerary.shareToken,
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
});

/**
 * GET /api/itineraries/shared/:shareToken
 *
 * Get a shared itinerary by share token (public, no auth required).
 * Returns read-only view without exposing userId.
 */
router.get('/shared/:shareToken', async (req, res) => {
  try {
    const shareToken = req.params.shareToken;

    const itinerary = await Itinerary.findOne({ shareToken });

    if (!itinerary) {
      return res.status(404).json({ error: 'Shared itinerary not found' });
    }

    if (!itinerary.isPublic) {
      return res.status(403).json({ error: 'This itinerary is not publicly shared' });
    }

    // Return itinerary without userId
    const itineraryData = itinerary.toObject();
    delete itineraryData.userId;
    delete itineraryData.guestId;
    delete itineraryData.shareToken;
    delete itineraryData.__v;

    res.status(200).json({
      itinerary: itineraryData,
      isReadOnly: true,
    });
  } catch (error) {
    console.error('Error fetching shared itinerary:', error);
    res.status(500).json({ error: 'Failed to fetch shared itinerary' });
  }
});

/**
 * GET /api/users/me/trips
 *
 * Get all saved trips for the authenticated user.
 */
router.get('/users/me/trips', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const itineraries = await Itinerary.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(itineraries);
  } catch (error) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

export default router;
