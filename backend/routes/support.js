import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import SupportTicket from '../models/SupportTicket.js';

const router = express.Router();

/**
 * @route POST /api/support/tickets
 * @desc Create a new support ticket
 */
router.post('/tickets', requireAuth, async (req, res) => {
  try {
    const { subject, category, priority, message, relatedBooking, relatedItinerary } = req.body;

    if (!subject || !category || !message) {
      return res.status(400).json({ error: 'Subject, category, and initial message are required.' });
    }

    const ticket = new SupportTicket({
      user: req.user._id,
      subject,
      category,
      priority: priority || 'medium',
      messages: [{
        sender: 'user',
        senderName: req.user.name || req.user.email,
        content: message,
        timestamp: new Date()
      }],
      relatedBooking: relatedBooking || null,
      relatedItinerary: relatedItinerary || null,
      lastActivityAt: new Date()
    });

    await ticket.save();
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/support/tickets
 * @desc List tickets for the logged in user
 */
router.get('/tickets', requireAuth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort({ lastActivityAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/support/tickets/:id
 * @desc Fetch support ticket details by ID
 */
router.get('/tickets/:id', requireAuth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found.' });
    }
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/support/tickets/:id/reply
 * @desc Reply to a support ticket
 */
router.post('/tickets/:id/reply', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Reply message content is required.' });
    }

    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found.' });
    }

    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      ticket.status = 'open'; // Re-open on customer reply
    }

    ticket.messages.push({
      sender: 'user',
      senderName: req.user.name || req.user.email,
      content,
      timestamp: new Date()
    });

    ticket.lastActivityAt = new Date();
    await ticket.save();

    // Auto AI Agent Responder Simulation (for rich premium feel)
    setTimeout(async () => {
      try {
        const autoReplyTicket = await SupportTicket.findById(ticket._id);
        if (autoReplyTicket && autoReplyTicket.status === 'open') {
          autoReplyTicket.messages.push({
            sender: 'ai',
            senderName: 'Journeys Assistant',
            content: `Thank you for your response. We have received your message regarding "${ticket.subject}". A customer support agent is review the ticket and will reply shortly.`,
            timestamp: new Date()
          });
          autoReplyTicket.status = 'in_progress';
          autoReplyTicket.lastActivityAt = new Date();
          await autoReplyTicket.save();
        }
      } catch (err) {
        console.error('Failed to trigger AI support auto-reply:', err);
      }
    }, 2000);

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/support/tickets/:id/close
 * @desc Close support ticket and optionally add satisfaction rating
 */
router.put('/tickets/:id/close', requireAuth, async (req, res) => {
  try {
    const { satisfaction } = req.body;
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found.' });
    }

    ticket.status = 'closed';
    ticket.resolvedAt = new Date();
    ticket.lastActivityAt = new Date();
    if (satisfaction !== undefined) {
      ticket.satisfaction = satisfaction;
    }

    await ticket.save();
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
