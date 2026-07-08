import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * GroupTrip
 * Wraps an Itinerary with a list of collaborators so multiple users
 * can view/edit/comment on the same trip plan.
 * One GroupTrip document per itinerary that has been turned into a group trip.
 */
const MemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    email: { type: String, trim: true, lowercase: true }, // for pending invites
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date, default: null },
  },
  { _id: false }
);

const GroupTripSchema = new Schema(
  {
    itinerary: {
      type: Schema.Types.ObjectId,
      ref: 'Itinerary',
      required: true,
      unique: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [MemberSchema],
    inviteToken: {
      type: String,
      index: true,
    },
    inviteTokenExpiresAt: { type: Date },
    // simple activity log for the group ("Riya changed Day 2 hotel")
    activity: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        action: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const GroupTrip = mongoose.model('GroupTrip', GroupTripSchema);

export default GroupTrip;
