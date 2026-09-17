import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Fish",
        "Prawns",
        "Crabs",
        "Lobsters",
        "Shellfish",
        "Dried Fish",
        "Fish Eggs",
      ],
      required: true,
    },

    variants: [
      {
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
          enum: ["kg", "g"],
          default: "kg",
        },

        cleaningInstruction: {
          type: String,
          trim: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        isAvailable: {
          type: Boolean,
          default: true,
        },

        availableWeight: {
          type: Number,
          default: 0,
          min: 0,
        },

        reservedWeight: {
          type: Number,
          default: 0,
          min: 0,
        },

        soldWeight: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

itemSchema.index({ category: 1, isAvailable: 1 });

const Item = mongoose.model("Item", itemSchema);

export default Item;
