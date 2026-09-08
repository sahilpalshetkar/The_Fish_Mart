import Item from "../models/item.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
  try {
    const { name, description, category, isAvailable } = req.body;

    const parsedVariants =
      typeof req.body.variants === "string"
        ? JSON.parse(req.body.variants)
        : req.body.variants;

    let image;

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      return res.status(400).json({
        message: "shop not found",
      });
    }

    const item = await Item.create({
      name,
      description,
      category,
      variants: parsedVariants,
      isAvailable,
      image,
      shop: shop._id,
    });

    shop.items.push(item._id);

    await shop.save();

    await shop.populate("owner");

    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    return res.status(200).json(shop);
  } catch (error) {
    console.error("Add Item Error:", error);

    return res.status(500).json({
      message: `add item error ${error.message}`,
    });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, description, category, variants, isAvailable } = req.body;

    const parsedVariants =
      typeof req.body.variants === "string"
        ? JSON.parse(req.body.variants)
        : req.body.variants;

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        description,
        category,
        variants: parsedVariants,
        isAvailable,
        image,
      },
      { new: true },
    );
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `edit item error ${error}` });
  }
};

export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error}` });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter((i) => i !== item._id);
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `delete item error ${error}` });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    return res.status(200).json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ message: `get all items error ${error}` });
  }
};

export const updateItemAvailability = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { isAvailable } = req.body;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    item.isAvailable = isAvailable;
    await item.save();

    return res.status(200).json({
      message: "Item availability updated",
      item,
    });
  } catch (error) {
    console.log("update availability error:", error);

    return res.status(500).json({
      message: "Failed to update item availability",
    });
  }
};

export const getBestSellerItems = async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $match: {
          orderStatus: "delivered",
          items: { $exists: true, $ne: [] },
        },
      },

      {
        $unwind: "$items",
      },

      {
        $match: {
          "items.item": { $exists: true, $ne: null },
          "items.quantity": { $gt: 0 },
        },
      },

      {
        $group: {
          _id: "$items.item",
          salesCount: {
            $sum: "$items.quantity",
          },
        },
      },

      {
        $sort: {
          salesCount: -1,
        },
      },

      {
        $limit: 8,
      },
    ]);

    if (!salesData.length) {
      return res.status(200).json([]);
    }

    const itemIds = salesData.map((sale) => sale._id);

    const items = await Item.find({
      _id: { $in: itemIds },
      isAvailable: true,
    });

    const bestSellers = salesData
      .map((sale) => {
        const item = items.find(
          (item) => item._id.toString() === sale._id.toString(),
        );

        if (!item) return null;

        return {
          ...item.toObject(),
          salesCount: sale.salesCount,
        };
      })
      .filter(Boolean);

    return res.status(200).json(bestSellers);
  } catch (error) {
    console.error("Best sellers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get best sellers",
      error: error.message,
    });
  }
};
