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
