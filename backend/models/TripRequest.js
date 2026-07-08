import mongoose from 'mongoose';

/**
 * TripRequest Schema
 *
 * Persists the search input criteria submitted by guests or registered users.
 * Mutual exclusion is enforced between userId and guestId on database validation.
 */
const tripRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    guestId: {
      type: String,
      default: null,
      index: true,
    },
    origin: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      label: { type: String, required: true, trim: true },
    },
    destination: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      label: { type: String, required: true, trim: true },
      placeId: { type: String, default: '' },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    budgetMin: {
      type: Number,
      required: [true, 'Minimum budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    budgetMax: {
      type: Number,
      required: [true, 'Maximum budget is required'],
      min: [0, 'Budget cannot be negative'],
    },

    // ─── Travel Context ─────────────────────────────────
    travelStyle: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury', 'backpacker'],
      default: 'mid-range',
    },
    travelers: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      infants: { type: Number, default: 0, min: 0 },
    },
    preferences: {
      accommodation: {
        type: String,
        enum: ['hotel', 'hostel', 'homestay', 'resort', 'any'],
        default: 'any',
      },
      activities: [{ type: String, trim: true }], // e.g. "trekking", "food tours"
      dietary: [{ type: String, trim: true }],     // e.g. "vegetarian", "halal"
      accessibility: [{ type: String, trim: true }],
    },
    interests: [{ type: String, trim: true }], // e.g. "heritage", "nightlife"
    flexibility: {
      dates: { type: Boolean, default: false },
      budget: { type: Boolean, default: false },
      destinations: { type: Boolean, default: false },
    },
    specialOccasion: {
      type: String,
      trim: true,
      default: '',
    }, // birthday, anniversary, honeymoon, etc.
    previousTrips: [{ type: String, trim: true }], // for AI context
  },
  {
    timestamps: true,
  }
);

// Enforce mutual exclusion: exactly one must be set
tripRequestSchema.pre('validate', async function () {
  const hasUser = this.userId != null;
  const hasGuest = this.guestId != null;

  if (hasUser && hasGuest) {
    throw new Error('TripRequest cannot have both userId and guestId');
  }
  if (!hasUser && !hasGuest) {
    throw new Error('TripRequest must have either userId or guestId');
  }
});

const TripRequest = mongoose.model('TripRequest', tripRequestSchema);

export default TripRequest;
