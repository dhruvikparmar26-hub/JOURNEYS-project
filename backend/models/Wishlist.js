import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Wishlist
 * A bookmarked destination a user (or guest) wants to visit later.
 * Not tied to a specific itinerary - just a place + optional notes/tags.
 */
const WishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    guestId: {
      type: String,
      index: true,
      default: null,
    },
    destination: {
      label: { type: String, required: true, trim: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    notes: { type: String, trim: true, maxlength: 500 },
    tags: [{ type: String, trim: true }], // e.g. "beach", "honeymoon", "budget"
    targetMonth: { type: String }, // e.g. "December" - when they want to go
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    coverImage: { type: String },
  },
  { timestamps: true }
);

WishlistSchema.pre('validate', function () {
  if (!this.user && !this.guestId) {
    throw new Error('Wishlist item requires either user or guestId');
  }
});

// Prevent duplicate bookmarks of the same destination label per owner
WishlistSchema.index(
  { user: 1, guestId: 1, 'destination.label': 1 },
  { unique: false }
);
WishlistSchema.index({ user: 1, createdAt: -1 });
WishlistSchema.index({ guestId: 1, createdAt: -1 });

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

export default Wishlist;
