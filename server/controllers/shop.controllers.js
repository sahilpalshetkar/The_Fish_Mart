import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
  try {
    const { name, address, city, state } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    let shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      shop = await Shop.create({
        name,
        address,
        city,
        state,
        image,
        owner: req.userId,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          address,
          city,
          state,
          image,
          owner: req.userId,
        },
        { new: true },
      );
    }
    await shop.populate("owner");
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `create shop error ${error}` });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({ path: "items", options: { sort: { createdAt: -1 } } });
    if (!shop) {
      return null;
    }
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `get my shop error ${error}` });
  }
};

export const updateShopStatus = async (req, res) => {
  try {
    const { isOpen } = req.body;
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({
        message: "Shop not found",
      });
    }
    shop.isOpen = isOpen;
    await shop.save();
    return res.status(200).json({
      message: `Shop is now ${shop.isOpen ? "open" : "closed"}`,
      isOpen: shop.isOpen,
    });
  } catch (error) {
    console.error("Update Shop Status Error:", error);
    return res.status(500).json({
      message: "Failed to update shop status",
    });
  }
};
