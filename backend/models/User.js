import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      // Not required — Google OAuth users won't have one
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    totpSecret: {
      type: String,
      default: null,
    },
    totpEnabled: {
      type: Boolean,
      default: false,
    },
    lastTotpCodeHash: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // ─── Extended Profile ────────────────────────────────
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer-not-to-say', null],
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    address: {
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
    },

    // ─── Travel Preferences ─────────────────────────────
    preferences: {
      travelStyle: {
        type: String,
        enum: ['budget', 'mid-range', 'luxury', 'backpacker', null],
        default: null,
      },
      dietaryRestrictions: [{ type: String, trim: true }],
      accessibility: [{ type: String, trim: true }], // e.g. "wheelchair", "visual-aid"
      preferredCurrency: { type: String, default: 'INR' },
      language: { type: String, default: 'en' },
      interests: [{ type: String, trim: true }], // e.g. "adventure", "food", "history"
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        priceAlerts: { type: Boolean, default: true },
        tripReminders: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
      },
    },

    // ─── Passport / Travel Documents ────────────────────
    passport: {
      number: { type: String, default: null },
      expiryDate: { type: Date, default: null },
      nationality: { type: String, trim: true, default: '' },
      issuingCountry: { type: String, trim: true, default: '' },
    },

    // ─── Emergency Contact ──────────────────────────────
    emergencyContact: {
      name: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      relation: { type: String, trim: true, default: '' },
    },

    // ─── Travel Stats (aggregated periodically) ─────────
    travelStats: {
      tripsCompleted: { type: Number, default: 0 },
      countriesVisited: { type: Number, default: 0 },
      citiesVisited: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      totalDistance: { type: Number, default: 0 }, // in km
      memberSince: { type: Date, default: Date.now },
    },

    // ─── Loyalty / Tier System ──────────────────────────
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },

    // ─── Social Links ───────────────────────────────────
    socialLinks: {
      instagram: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Don't return sensitive fields in JSON responses
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokenHash;
  delete obj.totpSecret;
  delete obj.failedLoginAttempts;
  delete obj.lockedUntil;
  delete obj.__v;
  return obj;
};

// Check if the account is currently locked
userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > new Date();
};

const User = mongoose.model('User', userSchema);

export default User;
