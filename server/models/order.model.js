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

    // =========================
    // ORDER ITEMS
    // =========================
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

    // =========================
    // PRICE
    // =========================
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

    // =========================
    // DELIVERY ADDRESS
    // =========================
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

    // =========================
    // LOCATION
    // =========================
    location: {
      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    // =========================
    // PAYMENT
    // =========================
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

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // =========================
    // ORDER STATUS
    // =========================
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

    // DELIVERY OTP
    deliveryOtp: {
      type: String,
      default: null,
    },

    deliveryOtpExpiresAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
