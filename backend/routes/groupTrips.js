import express from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import GroupTrip from '../models/GroupTrip.js';
import Itinerary from '../models/Itinerary.js';
import Notification from '../models/Notification.js';
import requireAuth from '../middleware/requireAuth.js';
import sendEmail from '../utils/email.js';

const router = express.Router();

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['editor', 'viewer']).optional(),
});

/**
 * POST /api/group-trips/:itineraryId/enable
 * Flow:
 *   requireAuth -> verify itinerary ownership -> create GroupTrip (idempotent)
 *   -> add owner as first member with role "owner", status "accepted"
 *   -> return group trip
 */
router.post('/:itineraryId/enable', requireAuth, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.itineraryId);
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
    if (String(itinerary.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not your itinerary' });
    }

    let group = await GroupTrip.findOne({ itinerary: itinerary._id });
    if (!group) {
      group = await GroupTrip.create({
        itinerary: itinerary._id,
        owner: req.user.id,
        members: [
          { user: req.user.id, role: 'owner', status: 'accepted' },
        ],
      });
    }
    return res.status(201).json({ group });
  } catch (err) {
    console.error('POST /group-trips/:id/enable error:', err);
    return res.status(500).json({ error: 'Failed to enable group trip' });
  }
});

/**
 * POST /api/group-trips/:itineraryId/invite
 * Flow:
 *   requireAuth -> verify caller is owner/editor of the group
 *   -> validate email + role
 *   -> add/refresh pending member entry
 *   -> generate inviteToken (if not already set) + expiry
 *   -> send invite email (reuses your existing email service)
 *   -> return invite link
 */
router.post('/:itineraryId/invite', requireAuth, async (req, res) => {
  try {
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { email, role } = parsed.data;

    const group = await GroupTrip.findOne({ itinerary: req.params.itineraryId });
    if (!group) return res.status(404).json({ error: 'Group trip not found. Enable it first.' });

    const caller = group.members.find(
      (m) => String(m.user) === String(req.user.id)
    );
    if (!caller || caller.role === 'viewer') {
      return res.status(403).json({ error: 'Only owner/editors can invite' });
    }

    const existing = group.members.find((m) => m.email === email);
    if (existing) {
      existing.status = 'pending';
      existing.role = role || existing.role || 'viewer';
      existing.invitedAt = new Date();
    } else {
      group.members.push({ email, role: role || 'viewer', status: 'pending' });
    }

    if (!group.inviteToken) {
      group.inviteToken = crypto.randomBytes(24).toString('hex');
    }
    group.inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    group.activity.push({
      user: req.user.id,
      action: `Invited ${email} as ${role || 'viewer'}`,
    });

    await group.save();

    // Send invitation email using email utility
    try {
      const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5180'}/itinerary/${req.params.itineraryId}?invite=${group.inviteToken}`;
      await sendEmail({
        to: email,
        subject: 'You have been invited to a group trip on JOURNEYS',
        html: `
          <h1>Group Trip Invitation</h1>
          <p>You have been invited by <strong>${req.user.email}</strong> to collaborate on their trip planning itinerary.</p>
          <p>Click the button below to join the group trip and start planning together!</p>
          <a href="${inviteUrl}" style="display: inline-block; background-color: #F2A93B; color: #0B0E14; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px; margin: 8px 0 24px;">Join Group Trip</a>
          <p>This invite expires in 7 days.</p>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send group trip invite email:', emailErr.message);
    }

    return res.status(201).json({
      inviteLink: `${process.env.FRONTEND_URL}/itinerary/${req.params.itineraryId}?invite=${group.inviteToken}`,
      group,
    });
  } catch (err) {
    console.error('POST /group-trips/:id/invite error:', err);
    return res.status(500).json({ error: 'Failed to send invite' });
  }
});

/**
 * POST /api/group-trips/:itineraryId/accept
 * Flow:
 *   requireAuth -> validate invite token from query/body
 *   -> find pending member entry matching req.user.email
 *   -> mark accepted, attach user._id
 *   -> notify group owner
 */
router.post('/:itineraryId/accept', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const group = await GroupTrip.findOne({ itinerary: req.params.itineraryId });
    if (!group) return res.status(404).json({ error: 'Group trip not found' });

    if (
      !token ||
      group.inviteToken !== token ||
      (group.inviteTokenExpiresAt && group.inviteTokenExpiresAt < new Date())
    ) {
      return res.status(400).json({ error: 'Invalid or expired invite' });
    }

    const member = group.members.find((m) => m.email === req.user.email);
    if (!member) {
      return res.status(403).json({ error: 'You were not invited to this trip' });
    }

    member.user = req.user.id;
    member.status = 'accepted';
    member.respondedAt = new Date();
    group.activity.push({ user: req.user.id, action: 'Joined the trip' });
    await group.save();

    await Notification.create({
      userId: group.owner,
      type: 'group_trip_joined',
      message: `${req.user.email} joined your group trip.`,
    });

    return res.json({ group });
  } catch (err) {
    console.error('POST /group-trips/:id/accept error:', err);
    return res.status(500).json({ error: 'Failed to accept invite' });
  }
});

/**
 * GET /api/group-trips/:itineraryId
 * requireAuth -> must be a member -> return group with populated members
 */
router.get('/:itineraryId', requireAuth, async (req, res) => {
  try {
    const group = await GroupTrip.findOne({ itinerary: req.params.itineraryId })
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email');
    if (!group) return res.status(404).json({ error: 'Group trip not found' });

    const isMember = group.members.some(
      (m) => m.user && String(m.user._id || m.user) === String(req.user.id)
    );
    if (!isMember) return res.status(403).json({ error: 'Not a member of this trip' });

    return res.json({ group });
  } catch (err) {
    console.error('GET /group-trips/:id error:', err);
    return res.status(500).json({ error: 'Failed to fetch group trip' });
  }
});

/**
 * DELETE /api/group-trips/:itineraryId/members/:memberEmail
 * requireAuth -> owner only -> remove a member (revoke access)
 */
router.delete('/:itineraryId/members/:memberEmail', requireAuth, async (req, res) => {
  try {
    const group = await GroupTrip.findOne({ itinerary: req.params.itineraryId });
    if (!group) return res.status(404).json({ error: 'Group trip not found' });
    if (String(group.owner) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Only the owner can remove members' });
    }
    group.members = group.members.filter(
      (m) => m.email !== req.params.memberEmail
    );
    group.activity.push({
      user: req.user.id,
      action: `Removed ${req.params.memberEmail}`,
    });
    await group.save();
    return res.json({ group });
  } catch (err) {
    console.error('DELETE /group-trips/:id/members error:', err);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;
