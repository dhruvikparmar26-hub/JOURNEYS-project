import express from 'express';
import optionalAuth from '../middleware/optionalAuth.js';
import ChatSession from '../models/ChatSession.js';
import Destination from '../models/Destination.js';

const router = express.Router();

/**
 * @route POST /api/chat
 * @desc Send message and get AI travel response
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { message, sessionId, destinationContext } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const userId = req.user ? req.user._id : null;
    const guestId = req.guestId || null;

    let session = null;
    if (sessionId) {
      session = await ChatSession.findOne({
        _id: sessionId,
        $or: [{ userId }, { guestId }]
      });
    }

    if (!session) {
      session = new ChatSession({
        userId,
        guestId,
        title: message.substring(0, 40) + '...',
        messages: [],
        context: {
          currentDestination: destinationContext || null,
        }
      });
    }

    // Append user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Generate AI assistant reply
    let responseText = '';
    const lowerMessage = message.toLowerCase();

    // Check if user is asking about safety
    if (lowerMessage.includes('safe') || lowerMessage.includes('safety')) {
      responseText = `Safety is paramount when planning travels! Overall, typical tourist destinations (like Kerala, the Golden Triangle, Rajasthan) are relatively secure. However, keep these guidelines in mind:\n\n1. **Emergency Numbers**: Keep local police (100) and ambulance (108) contacts handy.\n2. **Local Guidelines**: Dress modestly when visiting spiritual sites or temples.\n3. **Transport**: Use registered prepaid cabs or rideshare applications (Ola/Uber) rather than unmetered autos at night.\n4. **Hydration**: Consume bottled drinking water and avoid raw street foods from unverified vendors.`;
    } 
    // Check if asking about budget or cost
    else if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      responseText = `When planning budget allocations for your trip, consider these general average pricing structures:\n\n- **Backpacker**: ₹1,500 – ₹3,000 / day (hostels, public transits, local street diner foods).\n- **Mid-range Explorer**: ₹4,500 – ₹8,000 / day (3-star hotels/homestays, private cabs, standard restaurants).\n- **Premium Luxury**: ₹15,000+ / day (5-star heritage hotels/resorts, premium flight bookings, fine-dining options).\n\n*Pro Tip: Applying coupons like **JOURNEY10** during checkout or tracking price drops via our Price Alerts tool can help cut total costs by up to 15%!*`;
    }
    // Check if asking for recommendations
    else if (lowerMessage.includes('recommend') || lowerMessage.includes('where to') || lowerMessage.includes('suggest')) {
      // Find a featured destination if possible
      const destinationList = await Destination.find({ isActive: true }).limit(3);
      if (destinationList.length > 0) {
        responseText = `Based on your request, I highly recommend exploring these breathtaking destinations:\n\n` + 
          destinationList.map((dest, i) => `${i + 1}. **${dest.name}** (${dest.country}) - ${dest.shortDescription || dest.description.substring(0, 100) + '...'}\n   *Best time*: ${dest.bestTimeToVisit?.from || 'October'} to ${dest.bestTimeToVisit?.to || 'March'}`).join('\n\n') +
          `\n\nWould you like me to generate a custom itinerary layout for any of these?`;
      } else {
        responseText = `Here are some popular travel suggestions:\n\n1. **Golden Triangle (Delhi-Agra-Jaipur)**: Perfect for heritage, fort tours, and historical monuments.\n2. **Kerala Backwaters**: Relaxing houseboats, lush spice plantations, and Ayurvedic therapies.\n3. **Himalayan Escape (Manali/Ladakh)**: Ideal for adventure sports, scenic snow caps, and mountain trekking.\n\nLet me know if any of these catch your attention!`;
      }
    }
    // Check if weather-related
    else if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('temp') || lowerMessage.includes('season')) {
      responseText = `Weather conditions vary widely depending on the region:\n\n- **Winter (Oct - Mar)**: Best time for sightseeing across most parts of India. Comfortable temperatures (15°C to 28°C).\n- **Summer (Apr - Jun)**: Hot and humid in plains (often exceeding 40°C). Head to hill-stations (like Shimla, Ooty, Munnar) where temperatures stay cool.\n- **Monsoon (Jul - Sep)**: Heavy rainfalls, especially in coastal regions like Kerala and Goa. Perfect for scenic waterfalls and lush valleys, but watch out for transport disruptions.\n\nWould you like a weather breakdown for a specific destination?`;
    }
    // Default reply
    else {
      responseText = `Greetings! I am your Journeys AI travel assistant. I can help you plan custom itineraries, recommend stays, locate budget-friendly alternatives, inspect local weather forecasts, and check packing lists.\n\nAsk me questions like:\n- *"Suggest safe places to travel for a family trip"* \n- *"What is the average daily cost for mid-range travel?"* \n- *"Recommend historical destinations in North India"* \n- *"What should I pack for rainy weather?"*`;
    }

    // Append AI response
    session.messages.push({
      role: 'assistant',
      content: responseText,
      timestamp: new Date()
    });

    session.messageCount = session.messages.length;
    session.lastMessageAt = new Date();
    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      sessionTitle: session.title,
      reply: responseText,
      messages: session.messages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/chat/sessions
 * @desc Retrieve user's active chat session histories
 */
router.get('/sessions', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const guestId = req.guestId || null;

    if (!userId && !guestId) {
      return res.json({ success: true, sessions: [] });
    }

    const sessions = await ChatSession.find({
      $or: [{ userId }, { guestId }],
      status: 'active'
    })
    .select('title lastMessageAt messageCount context')
    .sort({ lastMessageAt: -1 });

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/chat/sessions/:id
 * @desc Get chat history details of a specific session
 */
router.get('/sessions/:id', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const guestId = req.guestId || null;

    const session = await ChatSession.findOne({
      _id: req.params.id,
      $or: [{ userId }, { guestId }]
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/chat/sessions/:id
 * @desc Delete / archive a chat session
 */
router.delete('/sessions/:id', optionalAuth, async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const guestId = req.guestId || null;

    const session = await ChatSession.findOne({
      _id: req.params.id,
      $or: [{ userId }, { guestId }]
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    // Set to archive instead of hard delete for history caching
    session.status = 'archived';
    await session.save();

    res.json({ success: true, message: 'Session archived successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
