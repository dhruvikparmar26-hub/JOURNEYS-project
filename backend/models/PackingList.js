import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * PackingList
 * Cached AI/rule-based generated packing list + travel tips for a given
 * itinerary, so we don't regenerate on every page view.
 */
const PackingListSchema = new Schema(
  {
    itinerary: {
      type: Schema.Types.ObjectId,
      ref: 'Itinerary',
      required: true,
      unique: true,
      index: true,
    },
    destination: { type: String, required: true },
    season: { type: String }, // e.g. "winter", "monsoon", "summer"
    tripType: { type: String }, // e.g. "beach", "adventure", "business", "family"
    categories: [
      {
        name: { type: String, required: true }, // "Clothing", "Documents", "Electronics"...
        items: [
          {
            label: { type: String, required: true },
            quantity: { type: String, default: '' }, // "3", "1 pair", ""
            essential: { type: Boolean, default: true },
            checked: { type: Boolean, default: false },
          },
        ],
      },
    ],
    travelTips: [{ type: String }],
    generatedBy: {
      type: String,
      enum: ['ai', 'rules'],
      default: 'rules',
    },
  },
  { timestamps: true }
);

const PackingList = mongoose.model('PackingList', PackingListSchema);

export default PackingList;
