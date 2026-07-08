/**
 * packingListGenerator.js
 *
 * Generates a packing list + travel tips for a destination/season/trip type.
 *
 * Two modes:
 *  1. AI mode (if ANTHROPIC_API_KEY is set): calls Claude to generate a
 *     tailored list as JSON.
 *  2. Rules mode (fallback, always works, no API key needed): builds a
 *     list from static category templates + season/trip-type modifiers.
 *
 * This mirrors your existing pattern for GOOGLE_MAPS_API_KEY: use the
 * real service if configured, otherwise fall back gracefully.
 */

const BASE_CATEGORIES = {
  Documents: ['Passport / ID', 'Travel tickets', 'Hotel booking confirmation', 'Travel insurance copy'],
  Electronics: ['Phone charger', 'Power bank', 'Universal adapter', 'Camera'],
  Toiletries: ['Toothbrush & toothpaste', 'Sunscreen', 'Moisturizer', 'Basic first-aid kit'],
  Clothing: ['Comfortable walking shoes', 'Underwear (1 per day)', 'Socks (1 per day)'],
  Misc: ['Reusable water bottle', 'Daypack', 'Snacks for travel'],
};

const SEASON_ADDITIONS = {
  winter: {
    Clothing: ['Heavy jacket', 'Thermal wear', 'Gloves', 'Woolen cap', 'Scarf'],
    Misc: ['Lip balm', 'Moisturizing lotion'],
  },
  summer: {
    Clothing: ['Light cotton clothes', 'Hat/cap', 'Sunglasses'],
    Misc: ['Extra sunscreen', 'Electrolyte sachets'],
  },
  monsoon: {
    Clothing: ['Raincoat/poncho', 'Quick-dry clothes'],
    Misc: ['Umbrella', 'Waterproof bag cover', 'Extra socks'],
  },
  spring: {
    Clothing: ['Light layers', 'Light jacket for evenings'],
    Misc: [],
  },
  autumn: {
    Clothing: ['Light sweater', 'Light jacket'],
    Misc: [],
  },
};

const TRIP_TYPE_ADDITIONS = {
  beach: {
    Clothing: ['Swimwear', 'Flip-flops', 'Beach cover-up'],
    Misc: ['Beach towel', 'Waterproof phone pouch'],
  },
  adventure: {
    Clothing: ['Quick-dry hiking clothes', 'Trekking shoes'],
    Misc: ['Headlamp/flashlight', 'Multi-tool', 'Energy bars'],
  },
  business: {
    Clothing: ['Formal wear', 'Blazer', 'Formal shoes'],
    Electronics: ['Laptop & charger', 'Business cards'],
  },
  family: {
    Misc: ['Entertainment for kids', 'Extra snacks', 'Basic medicines for children'],
  },
  honeymoon: {
    Misc: ['Camera for memories', 'A nice outfit for dinner'],
  },
  budget: {
    Misc: ['Reusable food containers', 'Laundry bag (to pack fewer clothes)'],
  },
};

const TRAVEL_TIPS_POOL = {
  winter: [
    'Layer your clothing so you can adjust to indoor heating vs outdoor cold.',
    'Check if your destination gets icy - pack shoes with good grip.',
  ],
  summer: [
    'Stay hydrated and avoid peak afternoon sun for outdoor activities.',
    'Book activities for early morning or evening to avoid the heat.',
  ],
  monsoon: [
    'Keep a spare set of clothes in a waterproof bag in case you get caught in rain.',
    'Check local weather daily since monsoon showers can be unpredictable.',
  ],
  beach: [
    'Reapply sunscreen every 2 hours if you are in the water often.',
    'Rinse off sea water/sand as soon as possible to avoid skin irritation.',
  ],
  adventure: [
    'Break in your trekking shoes before the trip to avoid blisters.',
    'Share your day plan with someone if heading into remote areas.',
  ],
  business: [
    'Carry a portable steamer or wrinkle-release spray for formal wear.',
    'Confirm meeting locations and Wi-Fi availability in advance.',
  ],
  general: [
    'Keep a digital + physical copy of important documents.',
    'Notify your bank of travel dates to avoid card blocks.',
    'Pack a small day bag for daily excursions separate from your main luggage.',
  ],
};

function mergeCategory(base, addition) {
  return Array.from(new Set([...(base || []), ...(addition || [])]));
}

/**
 * generateRuleBasedPackingList
 * @param {Object} opts - { destination, season, tripType }
 * @returns {Object} { categories, travelTips, generatedBy: 'rules' }
 */
export function generateRuleBasedPackingList({ destination, season, tripType }) {
  const seasonKey = (season || '').toLowerCase();
  const tripKey = (tripType || '').toLowerCase();

  const merged = JSON.parse(JSON.stringify(BASE_CATEGORIES));

  const seasonAdd = SEASON_ADDITIONS[seasonKey];
  if (seasonAdd) {
    for (const [cat, items] of Object.entries(seasonAdd)) {
      merged[cat] = mergeCategory(merged[cat], items);
    }
  }

  const tripAdd = TRIP_TYPE_ADDITIONS[tripKey];
  if (tripAdd) {
    for (const [cat, items] of Object.entries(tripAdd)) {
      merged[cat] = mergeCategory(merged[cat], items);
    }
  }

  const categories = Object.entries(merged).map(([name, items]) => ({
    name,
    items: items.map((label) => ({ label, quantity: '', essential: true })),
  }));

  const travelTips = [
    ...(TRAVEL_TIPS_POOL[seasonKey] || []),
    ...(TRAVEL_TIPS_POOL[tripKey] || []),
    ...TRAVEL_TIPS_POOL.general,
  ].slice(0, 6);

  return { categories, travelTips, generatedBy: 'rules' };
}

/**
 * generateAIPackingList
 * Calls Claude (Anthropic API) to produce a tailored packing list as JSON.
 * Falls back to rule-based generation if the call fails or the key is absent.
 */
export async function generateAIPackingList({ destination, season, tripType, days }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return generateRuleBasedPackingList({ destination, season, tripType });
  }

  try {
    const prompt = `Generate a packing list and travel tips for a trip to ${destination}, during ${season || 'unspecified'} season, trip type: ${tripType || 'general'}, duration: ${days || 'a few'} days.
Respond ONLY with valid JSON in this exact shape, no markdown, no preamble:
{
  "categories": [{ "name": "string", "items": [{ "label": "string", "quantity": "string", "essential": true }] }],
  "travelTips": ["string", "string"]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .replace(/```json|```/g, '')
      .trim();

    const parsed = JSON.parse(text);
    return { ...parsed, generatedBy: 'ai' };
  } catch (err) {
    console.error('AI packing list generation failed, falling back to rules:', err.message);
    return generateRuleBasedPackingList({ destination, season, tripType });
  }
}
