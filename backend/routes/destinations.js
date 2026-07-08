import express from 'express';
import Destination from '../models/Destination.js';
import Review from '../models/Review.js';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

/**
 * @route GET /api/destinations
 * @desc Get all destinations with query filters
 */
router.get('/', async (req, res) => {
  try {
    const { category, continent, maxBudget, search, limit = 12, page = 1 } = req.query;
    const query = { isActive: true };

    if (category) {
      query.categories = category;
    }
    if (continent) {
      query.continent = continent;
    }
    if (maxBudget) {
      const budgetNum = Number(maxBudget);
      if (budgetNum <= 3000) {
        query['avgBudgetPerDay.budget'] = { $lte: budgetNum };
      } else if (budgetNum <= 10000) {
        query['avgBudgetPerDay.midRange'] = { $lte: budgetNum };
      } else {
        query['avgBudgetPerDay.luxury'] = { $lte: budgetNum };
      }
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
      ];
    }

    const count = await Destination.countDocuments(query);
    const destinations = await Destination.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ popularityScore: -1 });

    res.json({
      success: true,
      destinations,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/destinations/featured
 * @desc Get featured & popular destinations
 */
router.get('/featured', async (req, res) => {
  try {
    const featured = await Destination.find({ isFeatured: true, isActive: true })
      .limit(6)
      .sort({ averageRating: -1 });
    
    res.json({ success: true, destinations: featured });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/destinations/:slug
 * @desc Fetch detailed destination info by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const destination = await Destination.findOne({ slug: req.params.slug, isActive: true });
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found.' });
    }
    res.json({ success: true, destination });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/destinations/:slug/reviews
 * @desc Get all reviews for a destination
 */
router.get('/:slug/reviews', async (req, res) => {
  try {
    const dest = await Destination.findOne({ slug: req.params.slug });
    if (!dest) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    // Find reviews containing this destination (either matching name or destinationId)
    const reviews = await Review.find({
      $or: [
        { destinationId: dest._id },
        { destination: { $regex: new RegExp(`^${dest.name}$`, 'i') } }
      ],
      status: 'visible'
    })
    .populate('user', 'name avatar role')
    .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/destinations/:slug/similar
 * @desc Find similar destinations based on tags / categories
 */
router.get('/:slug/similar', async (req, res) => {
  try {
    const dest = await Destination.findOne({ slug: req.params.slug });
    if (!dest) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    const similar = await Destination.find({
      _id: { $ne: dest._id },
      categories: { $in: dest.categories },
      isActive: true
    })
    .limit(4)
    .sort({ popularityScore: -1 });

    res.json({ success: true, destinations: similar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/destinations
 * @desc Admin: Add a new destination
 */
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const destinationData = req.body;
    if (!destinationData.slug) {
      destinationData.slug = destinationData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    const existing = await Destination.findOne({ slug: destinationData.slug });
    if (existing) {
      return res.status(400).json({ error: 'Destination with this name or slug already exists.' });
    }

    const destination = new Destination(destinationData);
    await destination.save();

    res.status(201).json({ success: true, destination });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/destinations/:id
 * @desc Admin: Update an existing destination
 */
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    res.json({ success: true, destination });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
