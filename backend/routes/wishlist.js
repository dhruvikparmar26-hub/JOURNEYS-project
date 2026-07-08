import express from 'express';
import { z } from 'zod';
import Wishlist from '../models/Wishlist.js';
import optionalAuth from '../middleware/optionalAuth.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();

const destinationSchema = z.object({
  label: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const wishlistSchema = z.object({
  destination: destinationSchema,
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  targetMonth: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  coverImage: z.string().optional(),
});

/**
 * Helper: build the owner filter — logged-in user takes priority over guest.
 * req.user is set by requireAuth (if used); req.guestId is set by guestSession
 * middleware (applied globally in server.js, per your existing setup).
 */
function ownerFilter(req) {
  if (req.user) return { user: req.user.id };
  if (req.guestId) return { guestId: req.guestId };
  return null;
}

/**
 * POST /api/wishlist
 * Flow:
 *   guestSession (global) -> optionalAuth (attaches req.user if token present)
 *   -> validate body
 *   -> determine owner (user or guest)
 *   -> create Wishlist item
 *   -> return item
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const parsed = wishlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const owner = req.user
      ? { user: req.user.id }
      : { guestId: req.guestId };

    if (!owner.user && !owner.guestId) {
      return res.status(400).json({ error: 'No session found' });
    }

    const item = await Wishlist.create({ ...owner, ...parsed.data });
    return res.status(201).json({ item });
  } catch (err) {
    console.error('POST /wishlist error:', err);
    return res.status(500).json({ error: 'Failed to save to wishlist' });
  }
});

/**
 * GET /api/wishlist
 * Flow:
 *   optionalAuth -> find items for user or guest -> sort priority desc, newest first
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const filter = ownerFilter(req);
    if (!filter) return res.json({ items: [] });

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const items = await Wishlist.find(filter).sort({ createdAt: -1 }).lean();
    items.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
    return res.json({ items });
  } catch (err) {
    console.error('GET /wishlist error:', err);
    return res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

/**
 * PATCH /api/wishlist/:id
 * Flow: optionalAuth -> verify ownership -> update fields
 */
router.patch('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await Wishlist.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const isOwner =
      (req.user && String(item.user) === String(req.user.id)) ||
      (req.guestId && item.guestId === req.guestId);
    if (!isOwner) return res.status(403).json({ error: 'Not your item' });

    const parsed = wishlistSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    Object.assign(item, parsed.data);
    await item.save();
    return res.json({ item });
  } catch (err) {
    console.error('PATCH /wishlist/:id error:', err);
    return res.status(500).json({ error: 'Failed to update item' });
  }
});

/**
 * DELETE /api/wishlist/:id
 */
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await Wishlist.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const isOwner =
      (req.user && String(item.user) === String(req.user.id)) ||
      (req.guestId && item.guestId === req.guestId);
    if (!isOwner) return res.status(403).json({ error: 'Not your item' });

    await item.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /wishlist/:id error:', err);
    return res.status(500).json({ error: 'Failed to delete item' });
  }
});

/**
 * POST /api/wishlist/claim
 * Flow (mirrors your existing "claim guest itineraries" pattern):
 *   requireAuth (must be logged in) -> reassign all guestId wishlist items
 *   from the guest cookie to the now-logged-in user.
 * Call this right after login/signup on the frontend.
 */
router.post('/claim', requireAuth, async (req, res) => {
  try {
    if (!req.guestId) return res.json({ claimed: 0 });
    const result = await Wishlist.updateMany(
      { guestId: req.guestId, user: null },
      { $set: { user: req.user.id, guestId: null } }
    );
    return res.json({ claimed: result.modifiedCount || 0 });
  } catch (err) {
    console.error('POST /wishlist/claim error:', err);
    return res.status(500).json({ error: 'Failed to claim wishlist items' });
  }
});

export default router;
