import { StateGraph, END } from '@langchain/langgraph';
import axios from 'axios';

// ─── State Definition ───────────────────────────────────────────────

// Simple state object - agents will return partial updates
const orchestratorState = {
  tripRequest: {
    origin: null,
    destination: null,
    startDate: null,
    endDate: null,
    budgetMin: null,
    budgetMax: null,
  },
  routeInfo: null,
  hotelResults: [],
  activityResults: [],
  conflicts: [],
  itinerary: null,
  ownerId: {
    userId: null,
    guestId: null,
  },
  log: [],
};

// ─── Helper Functions ───────────────────────────────────────────────

const addLogEntry = (state, agent, message) => {
  const timestamp = new Date().toISOString();
  state.log.push({ timestamp, agent, message });
  return state;
};

const calculateTripDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// ─── Mock Hotel Dataset ─────────────────────────────────────────────

const mockHotels = {
  jaipur: [
    {
      name: 'Rambagh Palace',
      rating: 4.8,
      pricePerNight: 25000,
      location: { lat: 26.9260, lng: 75.8235 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi'],
      description: 'Luxury heritage palace hotel',
    },
    {
      name: 'Taj Rambagh Palace',
      rating: 4.9,
      pricePerNight: 35000,
      location: { lat: 26.9240, lng: 75.8215 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'gym'],
      description: 'Former royal residence, now a luxury hotel',
    },
    {
      name: 'Fairmont Jaipur',
      rating: 4.7,
      pricePerNight: 18000,
      location: { lat: 26.9150, lng: 75.8350 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'gym'],
      description: 'Modern luxury with Rajasthani architecture',
    },
    {
      name: 'ITC Rajputana',
      rating: 4.6,
      pricePerNight: 12000,
      location: { lat: 26.9180, lng: 75.8070 },
      amenities: ['pool', 'restaurant', 'wifi', 'gym'],
      description: 'Premium business hotel with traditional decor',
    },
    {
      name: 'Holiday Inn Jaipur',
      rating: 4.3,
      pricePerNight: 8000,
      location: { lat: 26.9120, lng: 75.7870 },
      amenities: ['pool', 'restaurant', 'wifi'],
      description: 'Comfortable mid-range hotel',
    },
  ],
  delhi: [
    {
      name: 'The Imperial',
      rating: 4.8,
      pricePerNight: 20000,
      location: { lat: 28.6315, lng: 77.2167 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'gym'],
      description: 'Heritage luxury hotel near Connaught Place',
    },
    {
      name: 'Taj Palace',
      rating: 4.7,
      pricePerNight: 18000,
      location: { lat: 28.5650, lng: 77.1680 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'gym'],
      description: 'Premium luxury hotel in diplomatic area',
    },
    {
      name: 'The Oberoi',
      rating: 4.9,
      pricePerNight: 25000,
      location: { lat: 28.6130, lng: 77.2200 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'gym'],
      description: 'Ultra-luxury with city views',
    },
    {
      name: 'Hyatt Regency',
      rating: 4.5,
      pricePerNight: 10000,
      location: { lat: 28.5430, lng: 77.1550 },
      amenities: ['pool', 'restaurant', 'wifi', 'gym'],
      description: 'Business-friendly luxury hotel',
    },
    {
      name: 'Novotel',
      rating: 4.2,
      pricePerNight: 7000,
      location: { lat: 28.5350, lng: 77.1450 },
      amenities: ['pool', 'restaurant', 'wifi'],
      description: 'Modern hotel near airport',
    },
  ],
  mumbai: [
    {
      name: 'Taj Mahal Palace',
      rating: 4.9,
      pricePerNight: 30000,
      location: { lat: 18.9210, lng: 72.8340 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'gym'],
      description: 'Iconic heritage hotel overlooking Gateway of India',
    },
    {
      name: 'The Oberoi',
      rating: 4.8,
      pricePerNight: 28000,
      location: { lat: 19.0060, lng: 72.8280 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'gym'],
      description: 'Luxury hotel in Marine Drive',
    },
    {
      name: 'Trident Nariman Point',
      rating: 4.6,
      pricePerNight: 15000,
      location: { lat: 18.9450, lng: 72.8250 },
      amenities: ['pool', 'restaurant', 'wifi', 'gym'],
      description: 'Premium business hotel',
    },
    {
      name: 'Grand Hyatt',
      rating: 4.5,
      pricePerNight: 12000,
      location: { lat: 19.0750, lng: 72.8750 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'gym'],
      description: 'Luxury hotel in Santacruz',
    },
    {
      name: 'Novotel Mumbai',
      rating: 4.3,
      pricePerNight: 8000,
      location: { lat: 19.0850, lng: 72.8850 },
      amenities: ['pool', 'restaurant', 'wifi'],
      description: 'Modern hotel near airport',
    },
  ],
  udaipur: [
    {
      name: 'Taj Lake Palace',
      rating: 4.9,
      pricePerNight: 45000,
      location: { lat: 24.5750, lng: 73.6820 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi'],
      description: 'Floating palace on Lake Pichola',
    },
    {
      name: 'The Oberoi Udaivilas',
      rating: 4.8,
      pricePerNight: 40000,
      location: { lat: 24.5800, lng: 73.6900 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'gym'],
      description: 'Luxury resort with lake views',
    },
    {
      name: 'Leela Palace',
      rating: 4.7,
      pricePerNight: 25000,
      location: { lat: 24.5700, lng: 73.6750 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'gym'],
      description: 'Premium luxury hotel',
    },
    {
      name: 'Trident Udaipur',
      rating: 4.5,
      pricePerNight: 12000,
      location: { lat: 24.5650, lng: 73.6700 },
      amenities: ['pool', 'restaurant', 'wifi'],
      description: 'Comfortable hotel near lake',
    },
    {
      name: 'Ramada',
      rating: 4.2,
      pricePerNight: 7000,
      location: { lat: 24.5600, lng: 73.6650 },
      amenities: ['pool', 'restaurant', 'wifi'],
      description: 'Mid-range hotel',
    },
  ],
  goa: [
    {
      name: 'Taj Fort Aguada',
      rating: 4.7,
      pricePerNight: 22000,
      location: { lat: 15.4800, lng: 73.7750 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'beach'],
      description: 'Heritage resort on the beach',
    },
    {
      name: 'W Goa',
      rating: 4.6,
      pricePerNight: 18000,
      location: { lat: 15.5900, lng: 73.7550 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'beach'],
      description: 'Modern luxury beach resort',
    },
    {
      name: 'The Leela Goa',
      rating: 4.8,
      pricePerNight: 25000,
      location: { lat: 15.5200, lng: 73.8200 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'golf', 'beach'],
      description: 'Premium beach resort',
    },
    {
      name: 'Park Hyatt',
      rating: 4.5,
      pricePerNight: 15000,
      location: { lat: 15.5300, lng: 73.8100 },
      amenities: ['pool', 'spa', 'restaurant', 'wifi', 'beach'],
      description: 'Luxury beach resort',
    },
    {
      name: 'Alila Diwa',
      rating: 4.4,
      pricePerNight: 10000,
      location: { lat: 15.5400, lng: 73.8000 },
      amenities: ['pool', 'restaurant', 'wifi', 'spa'],
      description: 'Serene resort in South Goa',
    },
  ],
};

// ─── Mock Geocoding Function ─────────────────────────────────────────

const mockGeocode = async (placeName, city) => {
  // Simulate geocoding with mock coordinates
  const cityCoordinates = {
    jaipur: { lat: 26.9124, lng: 75.7873 },
    delhi: { lat: 28.6139, lng: 77.2090 },
    mumbai: { lat: 19.0760, lng: 72.8777 },
    udaipur: { lat: 24.5850, lng: 73.7125 },
    goa: { lat: 15.2993, lng: 74.1240 },
  };

  const baseCoords = cityCoordinates[city.toLowerCase()] || { lat: 0, lng: 0 };
  
  // Add slight random offset for different places
  const offset = (Math.random() - 0.5) * 0.02;
  
  return {
    lat: baseCoords.lat + offset,
    lng: baseCoords.lng + offset,
  };
};

// ─── Agent Nodes ─────────────────────────────────────────────────────

/**
 * Routing Agent
 * Calls the /api/route service to get distance, duration, and cost estimates
 */
const routingAgent = async (state) => {
  const { tripRequest } = state;
  
  try {
    const origin = {
      lat: tripRequest.origin.lat,
      lng: tripRequest.origin.lng,
      label: tripRequest.origin.label,
    };
    
    const destination = {
      lat: tripRequest.destination.lat,
      lng: tripRequest.destination.lng,
      label: tripRequest.destination.label,
    };

    // Call the route service (internal API call)
    const routeResponse = await axios.get('http://localhost:5050/api/route', {
      params: {
        origin: JSON.stringify(origin),
        destination: JSON.stringify(destination),
        mode: 'all',
      },
    });

    const routeData = routeResponse.data;
    
    state.routeInfo = {
      origin: tripRequest.origin.label,
      destination: tripRequest.destination.label,
      distanceKm: routeData.route.distanceKm,
      durationSeconds: routeData.route.durationSeconds,
      durationFormatted: routeData.route.durationFormatted,
      costs: routeData.costs,
    };

    state.log.push({
      timestamp: new Date().toISOString(),
      agent: 'Routing Agent',
      message: `Calculating route: ${tripRequest.origin.label} to ${tripRequest.destination.label} — ${routeData.route.distanceKm}km, ${routeData.route.durationFormatted}`,
    });

    return state;

  } catch (error) {
    console.error('Routing agent error:', error);
    // Fallback to estimated values if API fails
    state.routeInfo = {
      origin: tripRequest.origin.label,
      destination: tripRequest.destination.label,
      distanceKm: 200,
      durationSeconds: 14400,
      durationFormatted: '4h 0m',
      costs: {
        cab: { cost: 3000, duration: '4h 0m' },
        bus: { cost: 500, duration: '5h 30m' },
        train: { cost: 800, duration: '4h 30m' },
        flight: { cost: 5000, duration: '1h 0m' },
      },
    };

    state.log.push({
      timestamp: new Date().toISOString(),
      agent: 'Routing Agent',
      message: `Using estimated route: ${tripRequest.origin.label} to ${tripRequest.destination.label} — 200km, 4h 0m`,
    });

    return state;
  }
};

/**
 * Hotel Agent
 * Suggests 3-5 hotels based on destination, dates, and budget
 */
const hotelAgent = async (state) => {
  const { tripRequest, routeInfo } = state;
  
  const destinationCity = tripRequest.destination.label.toLowerCase();
  const tripDays = calculateTripDays(tripRequest.startDate, tripRequest.endDate);
  const budgetPerNight = tripRequest.budgetMax / tripDays;

  // Get hotels for the destination (fallback to generic if not found)
  const cityHotels = mockHotels[destinationCity] || mockHotels.delhi;
  
  // Filter hotels within budget
  const affordableHotels = cityHotels.filter(
    hotel => hotel.pricePerNight <= budgetPerNight * 1.5 // Allow 50% over budget for better options
  );

  // Sort by rating and price
  const sortedHotels = affordableHotels
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  state.hotelResults = sortedHotels.map(hotel => ({
    ...hotel,
    totalCost: hotel.pricePerNight * tripDays,
    withinBudget: hotel.pricePerNight <= budgetPerNight,
  }));

  state.log.push({
    timestamp: new Date().toISOString(),
    agent: 'Hotel Agent',
    message: `Found ${state.hotelResults.length} hotel options under budget (max ₹${budgetPerNight.toFixed(0)}/night)`,
  });

  // Log individual hotels
  state.hotelResults.forEach((hotel, index) => {
    state.log.push({
      timestamp: new Date().toISOString(),
      agent: 'Hotel Agent',
      message: `  ${index + 1}. ${hotel.name} — ₹${hotel.pricePerNight}/night, ${hotel.rating}★`,
    });
  });

  return state;
};

/**
 * Activity Agent
 * Suggests day-by-day activities and restaurants with geocoding
 */
const activityAgent = async (state) => {
  const { tripRequest, routeInfo } = state;
  
  const destinationCity = tripRequest.destination.label;
  const tripDays = calculateTripDays(tripRequest.startDate, tripRequest.endDate);

  // Mock activities based on destination
  const cityActivities = {
    jaipur: [
      { name: 'Amber Fort', type: 'attraction', duration: '3h', cost: 500 },
      { name: 'City Palace', type: 'attraction', duration: '2h', cost: 300 },
      { name: 'Hawa Mahal', type: 'attraction', duration: '1h', cost: 200 },
      { name: 'Jantar Mantar', type: 'attraction', duration: '1.5h', cost: 200 },
      { name: 'Nahargarh Fort', type: 'attraction', duration: '2h', cost: 300 },
      { name: 'Albert Hall Museum', type: 'attraction', duration: '2h', cost: 150 },
      { name: 'Chokhi Dhani', type: 'restaurant', duration: '3h', cost: 1500 },
      { name: 'Spice Court', type: 'restaurant', duration: '1.5h', cost: 800 },
      { name: 'Handicrafts Market', type: 'shopping', duration: '2h', cost: 1000 },
      { name: 'Johari Bazaar', type: 'shopping', duration: '2h', cost: 2000 },
    ],
    delhi: [
      { name: 'Red Fort', type: 'attraction', duration: '3h', cost: 500 },
      { name: 'India Gate', type: 'attraction', duration: '1h', cost: 0 },
      { name: 'Qutub Minar', type: 'attraction', duration: '2h', cost: 500 },
      { name: 'Humayun Tomb', type: 'attraction', duration: '2h', cost: 300 },
      { name: 'Lotus Temple', type: 'attraction', duration: '1.5h', cost: 0 },
      { name: 'Akshardham', type: 'attraction', duration: '3h', cost: 500 },
      { name: 'Karim\'s', type: 'restaurant', duration: '1.5h', cost: 600 },
      { name: 'Bukhara', type: 'restaurant', duration: '2h', cost: 3000 },
      { name: 'Connaught Place', type: 'shopping', duration: '3h', cost: 2000 },
      { name: 'Chandni Chowk', type: 'shopping', duration: '2h', cost: 1500 },
    ],
    mumbai: [
      { name: 'Gateway of India', type: 'attraction', duration: '1h', cost: 0 },
      { name: 'Elephanta Caves', type: 'attraction', duration: '4h', cost: 1000 },
      { name: 'Marine Drive', type: 'attraction', duration: '1h', cost: 0 },
      { name: 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya', type: 'attraction', duration: '3h', cost: 300 },
      { name: 'Siddhivinayak Temple', type: 'attraction', duration: '1h', cost: 0 },
      { name: 'Colaba Causeway', type: 'shopping', duration: '2h', cost: 3000 },
      { name: 'Cafe Leopold', type: 'restaurant', duration: '1.5h', cost: 800 },
      { name: 'Britannia & Co', type: 'restaurant', duration: '1.5h', cost: 600 },
      { name: 'Juhu Beach', type: 'attraction', duration: '2h', cost: 0 },
      { name: 'Bandra Worli Sea Link', type: 'attraction', duration: '1h', cost: 100 },
    ],
    udaipur: [
      { name: 'City Palace', type: 'attraction', duration: '3h', cost: 500 },
      { name: 'Lake Pichola Boat Ride', type: 'attraction', duration: '2h', cost: 800 },
      { name: 'Jag Mandir', type: 'attraction', duration: '2h', cost: 400 },
      { name: 'Saheliyon Ki Bari', type: 'attraction', duration: '1.5h', cost: 200 },
      { name: 'Fateh Sagar Lake', type: 'attraction', duration: '2h', cost: 0 },
      { name: 'Monsoon Palace', type: 'attraction', duration: '2h', cost: 300 },
      { name: 'Ambrai Restaurant', type: 'restaurant', duration: '2h', cost: 2000 },
      { name: 'Lake View Restaurant', type: 'restaurant', duration: '1.5h', cost: 1200 },
      { name: 'Hathi Pol Bazaar', type: 'shopping', duration: '2h', cost: 1500 },
      { name: 'Bagore Ki Haveli', type: 'attraction', duration: '2h', cost: 200 },
    ],
    goa: [
      { name: 'Baga Beach', type: 'attraction', duration: '3h', cost: 0 },
      { name: 'Calangute Beach', type: 'attraction', duration: '3h', cost: 0 },
      { name: 'Old Goa Churches', type: 'attraction', duration: '3h', cost: 200 },
      { name: 'Dudhsagar Falls', type: 'attraction', duration: '5h', cost: 1500 },
      { name: 'Fort Aguada', type: 'attraction', duration: '2h', cost: 300 },
      { name: 'Anjuna Market', type: 'shopping', duration: '3h', cost: 2000 },
      { name: 'Britto\'s', type: 'restaurant', duration: '2h', cost: 1500 },
      { name: 'Fisherman\'s Wharf', type: 'restaurant', duration: '2h', cost: 1800 },
      { name: 'Casino Royale', type: 'entertainment', duration: '3h', cost: 5000 },
      { name: 'Spice Plantation Tour', type: 'attraction', duration: '2h', cost: 800 },
    ],
  };

  const activities = cityActivities[destinationCity.toLowerCase()] || cityActivities.delhi;

  // Distribute activities across days
  const activitiesPerDay = Math.ceil(activities.length / tripDays);
  const dailyActivities = [];

  for (let day = 0; day < tripDays; day++) {
    const dayActivities = activities.slice(
      day * activitiesPerDay,
      (day + 1) * activitiesPerDay
    );

    const geocodedActivities = await Promise.all(
      dayActivities.map(async (activity) => {
        const coords = await mockGeocode(activity.name, destinationCity);
        return {
          ...activity,
          lat: coords.lat,
          lng: coords.lng,
          time: '10:00', // Default time, can be optimized
        };
      })
    );

    dailyActivities.push({
      dayNumber: day + 1,
      activities: geocodedActivities,
    });
  }

  state.activityResults = dailyActivities;

  state.log.push({
    timestamp: new Date().toISOString(),
    agent: 'Activity Agent',
    message: `Planning ${tripDays} days of activities in ${destinationCity}`,
  });

  dailyActivities.forEach((day) => {
    state.log.push({
      timestamp: new Date().toISOString(),
      agent: 'Activity Agent',
      message: `  Day ${day.dayNumber}: ${day.activities.length} activities planned`,
    });
  });

  return state;
};

/**
 * Itinerary Builder
 * Merges route, hotel, and activity results into a day-by-day plan
 * Runs conflict checks and generates the final itinerary
 */
const itineraryBuilder = async (state) => {
  const { tripRequest, routeInfo, hotelResults, activityResults } = state;
  
  const tripDays = calculateTripDays(tripRequest.startDate, tripRequest.endDate);
  const conflicts = [];

  // Calculate total estimated cost
  let totalCost = 0;

  // Add transportation cost (use cab as default)
  if (routeInfo?.costs?.cab) {
    totalCost += routeInfo.costs.cab.cost;
  }

  // Add hotel cost (use first hotel as recommendation)
  if (hotelResults.length > 0) {
    totalCost += hotelResults[0].totalCost;
  }

  // Add activity costs
  activityResults.forEach(day => {
    day.activities.forEach(activity => {
      totalCost += activity.cost || 0;
    });
  });

  // Budget conflict check
  if (totalCost > tripRequest.budgetMax) {
    conflicts.push({
      type: 'budget',
      severity: 'high',
      why: `Total estimated cost (₹${totalCost.toLocaleString()}) exceeds your maximum budget (₹${tripRequest.budgetMax.toLocaleString()}) by ₹${(totalCost - tripRequest.budgetMax).toLocaleString()}`,
    });
  } else if (totalCost < tripRequest.budgetMin) {
    conflicts.push({
      type: 'budget',
      severity: 'low',
      why: `Total estimated cost (₹${totalCost.toLocaleString()}) is below your minimum budget (₹${tripRequest.budgetMin.toLocaleString()}) by ₹${(tripRequest.budgetMin - totalCost).toLocaleString()}`,
    });
  }

  // Distance conflict check (activities too far from hotel)
  if (hotelResults.length > 0) {
    const hotelLocation = hotelResults[0].location;
    
    activityResults.forEach(day => {
      day.activities.forEach(activity => {
        if (activity.lat && activity.lng) {
          const distance = calculateDistance(
            hotelLocation.lat,
            hotelLocation.lng,
            activity.lat,
            activity.lng
          );

          if (distance > 15) {
            conflicts.push({
              type: 'distance',
              severity: 'medium',
              why: `${activity.name} is ${distance.toFixed(1)}km from your hotel, which may require significant travel time`,
              activity: activity.name,
              distance: distance.toFixed(1),
            });
          }
        }
      });
    });
  }

  // Time overlap conflict check (basic implementation)
  activityResults.forEach(day => {
    const timeSlots = {};
    day.activities.forEach(activity => {
      if (activity.time) {
        if (timeSlots[activity.time]) {
          conflicts.push({
            type: 'time_overlap',
            severity: 'medium',
            why: `Multiple activities scheduled at ${activity.time} on Day ${day.dayNumber}`,
            day: day.dayNumber,
            time: activity.time,
          });
        }
        timeSlots[activity.time] = true;
      }
    });
  });

  // Build the final itinerary
  state.conflicts = conflicts;
  state.itinerary = {
    title: `${tripRequest.destination.label} Trip (${tripDays} days)`,
    tripDays,
    totalCost,
    currency: 'INR',
    route: routeInfo,
    recommendedHotel: hotelResults.length > 0 ? hotelResults[0] : null,
    hotelAlternatives: hotelResults.slice(1),
    dailyPlan: activityResults,
    conflicts: conflicts,
    status: conflicts.length === 0 ? 'ready' : 'review_needed',
  };

  state.log.push({
    timestamp: new Date().toISOString(),
    agent: 'Itinerary Builder',
    message: `Building ${tripDays}-day itinerary with total cost ₹${totalCost.toLocaleString()}`,
  });

  if (conflicts.length > 0) {
    state.log.push({
      timestamp: new Date().toISOString(),
      agent: 'Itinerary Builder',
      message: `Found ${conflicts.length} conflicts requiring review`,
    });
    conflicts.forEach((conflict, index) => {
      state.log.push({
        timestamp: new Date().toISOString(),
        agent: 'Itinerary Builder',
        message: `  ${index + 1}. ${conflict.severity} priority: ${conflict.why}`,
      });
    });
  } else {
    state.log.push({
      timestamp: new Date().toISOString(),
      agent: 'Itinerary Builder',
      message: 'Itinerary ready — no conflicts detected',
    });
  }

  return state;
};

// ─── Helper: Calculate Distance (Haversine Formula) ───────────────

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─── Build the LangGraph ─────────────────────────────────────────────

export const createOrchestratorGraph = () => {
  const workflow = new StateGraph({
    channels: orchestratorState,
  });

  // Add nodes
  workflow.addNode('routing_agent', routingAgent);
  workflow.addNode('hotel_agent', hotelAgent);
  workflow.addNode('activity_agent', activityAgent);
  workflow.addNode('itinerary_builder', itineraryBuilder);

  // Define edges - sequential execution to avoid concurrent update issues
  workflow.setEntryPoint('routing_agent');
  workflow.addEdge('routing_agent', 'hotel_agent');
  workflow.addEdge('hotel_agent', 'activity_agent');
  workflow.addEdge('activity_agent', 'itinerary_builder');
  workflow.addEdge('itinerary_builder', END);

  return workflow.compile();
};

// ─── Run the Orchestrator ───────────────────────────────────────────

export const runOrchestrator = async (tripRequest, ownerId) => {
  const graph = createOrchestratorGraph();
  
  const initialState = {
    tripRequest,
    routeInfo: null,
    hotelResults: [],
    activityResults: [],
    conflicts: [],
    itinerary: null,
    ownerId,
    log: [],
  };

  // Add initial log entry
  initialState.log.push({
    timestamp: new Date().toISOString(),
    agent: 'System',
    message: `Starting itinerary generation for ${tripRequest.destination.label}`,
  });

  try {
    const result = await graph.invoke(initialState);
    return result;
  } catch (error) {
    console.error('Orchestrator execution error:', error);
    initialState.log.push({
      timestamp: new Date().toISOString(),
      agent: 'System',
      message: `Error: ${error.message}`,
    });
    return initialState;
  }
};
