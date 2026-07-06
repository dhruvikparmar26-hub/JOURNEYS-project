import mongoose from 'mongoose';

/**
 * Itinerary Schema
 *
 * Ownership model: every itinerary belongs to EITHER a registered user
 * (userId) OR an anonymous guest (guestId) — never both, never neither.
 * When a guest signs up, their itineraries are "claimed" by reassigning
 * userId and unsetting guestId via POST /api/auth/claim-guest-itineraries.
 */

const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    title: { type: String, default: '' },
    locations: [
      {
        name: { type: String, required: true },
        lat: { type: Number },
        lng: { type: Number },
        type: {
          type: String,
          enum: ['city', 'hotel', 'attraction', 'restaurant', 'transport', 'other'],
          default: 'city',
        },
        notes: { type: String, default: '' },
      },
    ],
    activities: [
      {
        time: { type: String },      // e.g. "09:00"
        description: { type: String },
        cost: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
      },
    ],
    travelSegments: [
      {
        from: { type: String },
        to: { type: String },
        mode: {
          type: String,
          enum: ['flight', 'train', 'bus', 'car', 'auto', 'walk', 'ferry'],
          default: 'car',
        },
        distanceKm: { type: Number },
        durationMinutes: { type: Number },
        cost: { type: Number, default: 0 },
      },
    ],
    dayCost: { type: Number, default: 0 },
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  {
    // ─── Ownership (exactly one must be set) ───────────────────
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

    // ─── Itinerary Content ─────────────────────────────────────
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    destinations: [
      {
        type: String,  // e.g. "Jaipur", "Udaipur", "Jodhpur"
      },
    ],
    days: [daySchema],

    // ─── Pricing ───────────────────────────────────────────────
    totalCost: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },

    // ─── Status ────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'generating', 'generated', 'saved', 'booked'],
      default: 'draft',
    },

    // ─── Metadata ──────────────────────────────────────────────
    prompt: {
      type: String,  // The original user prompt that generated this
      default: '',
    },
    generatedAt: {
      type: Date,
      default: null,
    },
    savedAt: {
      type: Date,
      default: null,
    },
    durationDays: {
      type: Number,
      default: 1,
    },
    travelerCount: {
      type: Number,
      default: 1,
    },
    tripStartDate: {
      type: Date,
      default: null,
    },
    tripEndDate: {
      type: Date,
      default: null,
    },

    // ─── Sharing ───────────────────────────────────────────────
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Schema Validation: exactly one owner ──────────────────────

itinerarySchema.pre('validate', async function () {
  const hasUser = this.userId != null;
  const hasGuest = this.guestId != null;

  if (hasUser && hasGuest) {
    throw new Error('Itinerary cannot have both userId and guestId');
  }
  if (!hasUser && !hasGuest) {
    throw new Error('Itinerary must have either userId or guestId');
  }
});

// ─── Indexes ───────────────────────────────────────────────────

itinerarySchema.index({ userId: 1, status: 1 });
itinerarySchema.index({ guestId: 1, status: 1 });
itinerarySchema.index({ createdAt: -1 });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;
