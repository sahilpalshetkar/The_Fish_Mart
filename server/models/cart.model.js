import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
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
      required: true,
    },

    category: {
      type: String,
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
        required: true,
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
      default: 1,
    },
    requestedWeight: {
      type: Number,
      required: true,
      min: 0.001,
    },
  },
  {
    _id: true,
  },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
