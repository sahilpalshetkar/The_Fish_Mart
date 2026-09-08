import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^\d{6}$/,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    estimatedDelivery: {
      type: String,
      required: true,
      default: "Same Day",
    },
  },
  {
    timestamps: true,
  },
);

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;
