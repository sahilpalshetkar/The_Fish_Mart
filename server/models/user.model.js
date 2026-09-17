import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      select: false,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["customer", "admin", "deliveryBoy"],
      default: "customer",
    },

    resetOtp: {
      type: String,
      select: false,
    },

    otpExpires: {
      type: Date,
      select: false,
    },

    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    otpLastSentAt: {
      type: Date,
      select: false,
    },

    resetTokenHash: {
      type: String,
      select: false,
    },

    resetTokenExpires: {
      type: Date,
      select: false,
    },

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" });
userSchema.index({ role: 1, isOnline: 1 });

const User = mongoose.model("User", userSchema);

export default User;
