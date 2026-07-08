import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * SupportTicket
 * Customer support ticket system. Users can create tickets,
 * and agents (or AI) can reply. Tracks status and satisfaction.
 */
const TicketMessageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'agent', 'ai'],
      required: true,
    },
    senderName: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    attachments: [{
      url: { type: String },
      name: { type: String },
      type: { type: String }, // mime type
    }],
  },
  { _id: true }
);

const SupportTicketSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: ['booking', 'payment', 'technical', 'general', 'feedback', 'cancellation', 'refund', 'account'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    messages: [TicketMessageSchema],
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'],
      default: 'open',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    relatedBooking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    relatedItinerary: {
      type: Schema.Types.ObjectId,
      ref: 'Itinerary',
      default: null,
    },
    satisfaction: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-generate ticket number
SupportTicketSchema.pre('save', async function () {
  if (!this.ticketNumber) {
    const count = await mongoose.model('SupportTicket').countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
});

SupportTicketSchema.index({ user: 1, status: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, priority: -1, lastActivityAt: -1 });

const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);

export default SupportTicket;
