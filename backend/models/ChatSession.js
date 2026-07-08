import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * ChatSession
 * Stores AI travel assistant chat conversations.
 * Each session can be linked to a destination or itinerary for contextual answers.
 */
const MessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    guestId: {
      type: String,
      default: null,
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxlength: 200,
    },
    messages: [MessageSchema],
    context: {
      currentDestination: { type: String, default: null },
      tripDates: {
        start: { type: Date, default: null },
        end: { type: Date, default: null },
      },
      preferences: {
        travelStyle: { type: String },
        budget: { type: String },
        interests: [{ type: String }],
      },
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    relatedItinerary: {
      type: Schema.Types.ObjectId,
      ref: 'Itinerary',
      default: null,
    },
    relatedDestination: {
      type: Schema.Types.ObjectId,
      ref: 'Destination',
      default: null,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

ChatSessionSchema.pre('validate', function () {
  if (!this.userId && !this.guestId) {
    throw new Error('ChatSession requires either userId or guestId');
  }
});

ChatSessionSchema.index({ userId: 1, status: 1, lastMessageAt: -1 });
ChatSessionSchema.index({ guestId: 1, status: 1, lastMessageAt: -1 });

const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);

export default ChatSession;
