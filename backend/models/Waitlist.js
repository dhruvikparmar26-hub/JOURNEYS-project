import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

waitlistSchema.index({ email: 1 });

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
