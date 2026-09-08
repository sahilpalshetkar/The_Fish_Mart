import mongoose from "mongoose";

const deliveryAssignmentSchema = new mongoose.Schema(
  {
    // ORDER
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    // DELIVERY BOYS WHO CAN ACCEPT
    broadcastedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ACTUAL DELIVERY BOY
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // STATUS
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "accepted",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // DATES
    assignedAt: {
      type: Date,
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const DeliveryAssignment = mongoose.model(
  "DeliveryAssignment",
  deliveryAssignmentSchema,
);

export default DeliveryAssignment;
