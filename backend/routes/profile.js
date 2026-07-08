import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Itinerary from '../models/Itinerary.js';

const router = express.Router();

/**
 * @route GET /api/profile
 * @desc Get current user profile
 */
router.get('/', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

/**
 * @route PUT /api/profile
 * @desc Update core profile fields
 */
router.put('/', requireAuth, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, bio, address } = req.body;
    const user = req.user;

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (bio !== undefined) user.bio = bio;
    if (address !== undefined) {
      user.address = {
        city: address.city || user.address?.city || '',
        state: address.state || user.address?.state || '',
        country: address.country || user.address?.country || '',
        postalCode: address.postalCode || user.address?.postalCode || '',
      };
    }

    await user.save();
    res.json({ success: true, user: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/profile/preferences
 * @desc Update user travel and notification preferences
 */
router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const { travelStyle, dietaryRestrictions, accessibility, preferredCurrency, language, interests, notifications } = req.body;
    const user = req.user;

    if (!user.preferences) user.preferences = {};

    if (travelStyle !== undefined) user.preferences.travelStyle = travelStyle;
    if (dietaryRestrictions !== undefined) user.preferences.dietaryRestrictions = dietaryRestrictions;
    if (accessibility !== undefined) user.preferences.accessibility = accessibility;
    if (preferredCurrency !== undefined) user.preferences.preferredCurrency = preferredCurrency;
    if (language !== undefined) user.preferences.language = language;
    if (interests !== undefined) user.preferences.interests = interests;
    
    if (notifications !== undefined) {
      user.preferences.notifications = {
        email: notifications.email !== undefined ? notifications.email : user.preferences.notifications?.email ?? true,
        push: notifications.push !== undefined ? notifications.push : user.preferences.notifications?.push ?? true,
        priceAlerts: notifications.priceAlerts !== undefined ? notifications.priceAlerts : user.preferences.notifications?.priceAlerts ?? true,
        tripReminders: notifications.tripReminders !== undefined ? notifications.tripReminders : user.preferences.notifications?.tripReminders ?? true,
        promotions: notifications.promotions !== undefined ? notifications.promotions : user.preferences.notifications?.promotions ?? false,
      };
    }

    await user.save();
    res.json({ success: true, user: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/profile/passport
 * @desc Update travel document / passport details
 */
router.put('/passport', requireAuth, async (req, res) => {
  try {
    const { number, expiryDate, nationality, issuingCountry } = req.body;
    const user = req.user;

    user.passport = {
      number: number !== undefined ? number : user.passport?.number ?? null,
      expiryDate: expiryDate !== undefined ? expiryDate : user.passport?.expiryDate ?? null,
      nationality: nationality !== undefined ? nationality : user.passport?.nationality ?? '',
      issuingCountry: issuingCountry !== undefined ? issuingCountry : user.passport?.issuingCountry ?? '',
    };

    await user.save();
    res.json({ success: true, user: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/profile/stats
 * @desc Fetch dynamic travel stats based on user bookings & saved itineraries
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch itineraries
    const totalTripsCount = await Itinerary.countDocuments({ userId, status: 'saved' });
    const bookedTripsCount = await Itinerary.countDocuments({ userId, status: 'booked' });

    // Fetch confirmed bookings
    const confirmedBookings = await Booking.find({ userId, status: 'confirmed' });
    
    // Sum total spent
    const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    // Find unique destinations visited
    const itineraries = await Itinerary.find({ userId, status: { $in: ['saved', 'booked'] } });
    const visitedSet = new Set();
    itineraries.forEach(itin => {
      itin.destinations.forEach(d => visitedSet.add(d));
    });

    const countriesSet = new Set();
    // Assuming some layout metadata maps destinations to countries, otherwise default to visitedSet size
    // In India-based app, let's treat states/destinations as units
    const citiesVisited = visitedSet.size;
    const countriesVisited = Math.max(1, Math.floor(citiesVisited / 3)); // Mock countries count from cities

    // Calculate traveler distance (mock value based on cities visited)
    const totalDistance = citiesVisited * 350; // average 350km per city travel

    // Update in user model for caching
    req.user.travelStats = {
      tripsCompleted: bookedTripsCount,
      countriesVisited,
      citiesVisited,
      totalSpent,
      totalDistance,
      memberSince: req.user.createdAt,
    };
    await req.user.save();

    res.json({
      success: true,
      stats: req.user.travelStats,
      loyaltyPoints: req.user.loyaltyPoints,
      tier: req.user.tier
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
