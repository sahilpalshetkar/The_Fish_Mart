import Item from "../models/item.model.js";

export const normalizeWeightToKg = (weight, weightUnit) => {
  const value = Number(weight);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  if (weightUnit === "g") {
    return value / 1000;
  }

  if (weightUnit === "kg") {
    return value;
  }

  return null;
};

export const reserveVariantStock = async ({
  itemId,
  variant,
  requestedWeight,
}) => {
  const weight = Number(requestedWeight);

  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error("Invalid requested weight");
  }

  const item = await Item.findOneAndUpdate(
    {
      _id: itemId,
      isAvailable: true,
      variants: {
        $elemMatch: {
          size: variant.size,
          weight: Number(variant.weight),
          weightUnit: variant.weightUnit,
          cleaningInstruction: variant.cleaningInstruction,
          isAvailable: true,
          availableWeight: { $gte: weight },
        },
      },
    },
    {
      $inc: {
        "variants.$.availableWeight": -weight,
        "variants.$.reservedWeight": weight,
      },
    },
    {
      new: true,
    },
  );

  if (!item) {
    throw new Error("Insufficient stock");
  }

  return item;
};
