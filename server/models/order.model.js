import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    variant: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      size: {
        type: String,
        required: true,
      },

      weight: {
        type: Number,
        required: true,
      },

      weightUnit: {
        type: String,
        required: true,
      },

      cleaningInstruction: {
        type: String,
        default: "",
      },
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    requestedWeight: {
      type: Number,
      required: true,
      min: 0.001,
    },

    actualWeight: {
      type: Number,
      default: null,
      min: 0,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    stockStatus: {
      type: String,
      enum: ["reserved", "sold", "released"],
      default: "reserved",
    },
  },
  {
    _id: true,
  },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: function (items) {
          return items.length > 0;
        },

        message: "Order must contain at least one item.",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      mobile: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        default: "",
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      landmark: {
        type: String,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{6}$/,
      },
    },

    location: {
      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "shipped",
        "out_for_delivery",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    estimatedDelivery: {
      type: String,
      default: "Same Day",
    },

    // DELIVERY ASSIGNMENT
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default: null,
    },

    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },

    deliveryOtp: {
      type: String,
      select: false,
    },
    deliveryOtpExpiresAt: {
      type: Date,
      select: false,
    },
    deliveryOtpLastSentAt: {
      type: Date,
      select: false,
    },
    deliveryOtpAttempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      select: false,
    },
    stockStatus: {
      type: String,
      enum: ["none", "reserved", "sold", "released"],
      default: "reserved",
    },

    stockReservedAt: {
      type: Date,
      default: null,
    },

    stockReservationExpiresAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({
  stockStatus: 1,
  stockReservationExpiresAt: 1,
});
orderSchema.index({ razorpayOrderId: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
