import mongoose from "mongoose";

const deliveryPincodeSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    deliveryFee: {
      type: Number,
      default: 49,
    },

    estimatedDelivery: {
      type: String,
      default: "Same day",
    },
  },
  {
    timestamps: true,
  },
);

const DeliveryPincode = mongoose.model(
  "DeliveryPincode",
  deliveryPincodeSchema,
);

export default DeliveryPincode;
