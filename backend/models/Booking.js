import mongoose from 'mongoose';

/**
 * Booking Schema
 *
 * Represents a booking made by an authenticated user with verified email.
 * This is the only endpoint in the app that requires a verified email since
 * it involves financial transactions.
 */
const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itineraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Itinerary',
      required: true,
      index: true,
    },
    // What was booked (e.g., hotel name, activity name)
    itemName: {
      type: String,
      required: true,
    },
    itemType: {
      type: String,
      enum: ['hotel', 'activity', 'transport', 'package'],
      required: true,
    },
    // Booking details
    bookingDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Booking status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    // External booking reference (if booked via third-party API)
    externalReference: {
      type: String,
      default: '',
    },
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ─── Travelers ──────────────────────────────────────
    travelers: [{
      name: { type: String, trim: true },
      age: { type: Number },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      passportNumber: { type: String, default: '' },
    }],

    // ─── Payment ────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cod', null],
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded'],
      default: 'unpaid',
    },
    transactionId: {
      type: String,
      default: '',
    },

    // ─── Cancellation ───────────────────────────────────
    cancellationPolicy: {
      type: String,
      default: '',
    },
    cancellationDeadline: {
      type: Date,
      default: null,
    },

    // ─── Coupon ─────────────────────────────────────────
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ─── Insurance ──────────────────────────────────────
    insuranceIncluded: {
      type: Boolean,
      default: false,
    },
    insuranceDetails: {
      provider: { type: String, default: '' },
      policyNumber: { type: String, default: '' },
      coverageAmount: { type: Number, default: 0 },
    },

    // ─── Stay Details (hotels) ──────────────────────────
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },

    // ─── Extras ─────────────────────────────────────────
    specialRequests: [{ type: String, trim: true }],
    confirmationPDF: {
      type: String,  // URL
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ itineraryId: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
