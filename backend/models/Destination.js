import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Destination
 * A curated travel destination with rich metadata for the Explore section.
 * Includes images, weather, budget ranges, tips, and linkage to reviews.
 */
const DestinationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    continent: {
      type: String,
      enum: ['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'],
      required: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      maxlength: 300,
    },
    highlights: [{ type: String, trim: true }],
    bestTimeToVisit: {
      from: { type: String }, // e.g. "October"
      to: { type: String },   // e.g. "March"
      description: { type: String },
    },
    avgBudgetPerDay: {
      budget: { type: Number, default: 0 },   // in INR
      midRange: { type: Number, default: 0 },
      luxury: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    languages: [{ type: String, trim: true }],
    currency: { type: String, default: 'INR' },
    timezone: { type: String },
    images: {
      hero: { type: String },                  // Main hero image URL
      gallery: [{ type: String }],             // Array of image URLs
      thumbnail: { type: String },             // Small card thumbnail
    },
    categories: [{
      type: String,
      enum: ['beach', 'mountain', 'city', 'heritage', 'adventure', 'spiritual', 'wildlife', 'desert', 'lake', 'hill-station', 'island', 'backpacking', 'nature'],
    }],
    weather: {
      summer: { avgTemp: Number, conditions: String },
      winter: { avgTemp: Number, conditions: String },
      monsoon: { avgTemp: Number, conditions: String },
    },
    travelTips: [{ type: String }],
    thingsToDo: [{
      name: { type: String },
      description: { type: String },
      category: { type: String, enum: ['sightseeing', 'food', 'adventure', 'shopping', 'nightlife', 'culture', 'nature'] },
      estimatedCost: { type: Number, default: 0 },
      duration: { type: String }, // e.g. "2-3 hours"
      image: { type: String },
    }],
    whereToStay: [{
      name: { type: String },
      type: { type: String, enum: ['budget', 'mid-range', 'luxury', 'hostel', 'homestay', 'resort'] },
      priceRange: { min: Number, max: Number },
      rating: { type: Number, min: 1, max: 5 },
      image: { type: String },
    }],
    howToReach: {
      byAir: { type: String },
      byTrain: { type: String },
      byRoad: { type: String },
      nearestAirport: { type: String },
      nearestRailway: { type: String },
    },
    localEmergency: {
      police: { type: String, default: '100' },
      ambulance: { type: String, default: '108' },
      fire: { type: String, default: '101' },
      touristHelpline: { type: String },
    },
    nearbyDestinations: [{
      type: Schema.Types.ObjectId,
      ref: 'Destination',
    }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    safetyScore: { type: Number, default: 0, min: 0, max: 10 },
    popularityScore: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    visaRequired: { type: Boolean, default: false },
    idealDuration: { type: String }, // e.g. "3-5 days"
  },
  { timestamps: true }
);

// Text search index
DestinationSchema.index({ name: 'text', description: 'text', country: 'text', region: 'text' });
DestinationSchema.index({ continent: 1, categories: 1 });
DestinationSchema.index({ isFeatured: 1, isActive: 1 });
DestinationSchema.index({ averageRating: -1, reviewCount: -1 });
DestinationSchema.index({ popularityScore: -1 });

const Destination = mongoose.model('Destination', DestinationSchema);

export default Destination;
