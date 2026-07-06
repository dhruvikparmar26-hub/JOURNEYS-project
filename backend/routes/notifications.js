import { Router } from 'express';
import Notification from '../models/Notification.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// GET /api/notifications — Get user's notifications (newest first)
// ═══════════════════════════════════════════════════════════════

router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// PATCH /api/notifications/:id/read — Mark notification as read
// ═══════════════════════════════════════════════════════════════

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({ notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// PATCH /api/notifications/read-all — Mark all notifications as read
// ═══════════════════════════════════════════════════════════════

router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
