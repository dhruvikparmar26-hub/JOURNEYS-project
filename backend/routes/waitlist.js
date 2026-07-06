import express from 'express';
import Waitlist from '../models/Waitlist.js';

const router = express.Router();

// POST /api/waitlist - Add email to waitlist
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const existing = await Waitlist.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already on waitlist' });
    }

    // Add to waitlist
    await Waitlist.create({ email });

    res.status(201).json({ message: 'Successfully added to waitlist' });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ error: 'Failed to add to waitlist' });
  }
});

export default router;
