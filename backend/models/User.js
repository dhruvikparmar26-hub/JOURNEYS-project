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
    name: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: null,
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
