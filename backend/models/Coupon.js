import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Coupon
 * Discount coupon codes for bookings. Admin-managed.
 */
const CouponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null, // null means no cap
    },
    currency: {
      type: String,
      default: 'INR',
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    usedByUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    applicableTo: [{
      type: String,
      enum: ['hotel', 'flight', 'activity', 'transport', 'package', 'all'],
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

CouponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

const Coupon = mongoose.model('Coupon', CouponSchema);

export default Coupon;
