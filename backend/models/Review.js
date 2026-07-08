import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Review
 * Stores a user's post-trip review/rating for a completed itinerary.
 * Split into sub-ratings (hotel, activities, overall) plus free text.
 */
const ReviewSchema = new Schema(
  {
    itinerary: {
      type: Schema.Types.ObjectId,
      ref: 'Itinerary',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    ratings: {
      overall: { type: Number, required: true, min: 1, max: 5 },
      hotel: { type: Number, min: 1, max: 5 },
      activities: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 }, // value for money
      transport: { type: Number, min: 1, max: 5 },
      safety: { type: Number, min: 1, max: 5 },
      food: { type: Number, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
    },
    title: { type: String, trim: true, maxlength: 120 },
    comment: { type: String, trim: true, maxlength: 3000 },
    photos: [{ type: String }], // URLs, optional
    tripCompletedAt: { type: Date },
    isPublic: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
    helpfulUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // ─── Extended Fields ────────────────────────────────
    destinationId: {
      type: Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
      index: true,
    },
    travelDate: {
      type: Date,
      default: null,
    },
    travelDuration: {
      type: Number, // in days
      default: null,
    },
    travelType: {
      type: String,
      enum: ['solo', 'couple', 'family', 'friends', 'business', null],
      default: null,
    },
    pros: [{ type: String, trim: true }],
    cons: [{ type: String, trim: true }],
    ownerResponse: {
      content: { type: String, trim: true, maxlength: 2000 },
      respondedAt: { type: Date, default: null },
    },
    verifiedTrip: {
      type: Boolean,
      default: false,
    },
    // moderation
    status: {
      type: String,
      enum: ['visible', 'flagged', 'hidden'],
      default: 'visible',
    },
  },
  { timestamps: true }
);

// One review per user per itinerary
ReviewSchema.index({ itinerary: 1, user: 1 }, { unique: true });
ReviewSchema.index({ destination: 1, isPublic: 1, status: 1, createdAt: -1 });

const Review = mongoose.model('Review', ReviewSchema);

export default Review;
