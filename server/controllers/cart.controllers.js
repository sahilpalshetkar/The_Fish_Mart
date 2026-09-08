import Cart from "../models/cart.model.js";
import Item from "../models/item.model.js";

const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + Number(item.price) * Number(item.quantity);
  }, 0);
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      itemId,
      size,
      weight,
      weightUnit,
      cleaning,
      quantity = 1,
    } = req.body;

    // Validate
    if (!itemId || !size || weight === undefined || !weightUnit || !cleaning) {
      return res.status(400).json({
        message:
          "Item, size, weight, weight unit and cleaning option are required.",
      });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }

    // Find product
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    // Product availability
    if (item.isAvailable === false) {
      return res.status(400).json({
        message: "This product is currently unavailable.",
      });
    }

    // Find exact variant
    const variant = item.variants?.find(
      (v) =>
        String(v.size) === String(size) &&
        Number(v.weight) === Number(weight) &&
        String(v.weightUnit) === String(weightUnit) &&
        String(v.cleaningInstruction) === String(cleaning),
    );

    if (!variant) {
      return res.status(400).json({
        message: "This variant is unavailable.",
      });
    }

    // Variant availability
    if (variant.isAvailable === false) {
      return res.status(400).json({
        message: "This variant is currently unavailable.",
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: userId });

    // Create cart
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0,
      });
    }

    // Check if exact variant already exists
    const existingItem = cart.items.find(
      (cartItem) =>
        String(cartItem.item) === String(itemId) &&
        String(cartItem.variant.size) === String(variant.size) &&
        Number(cartItem.variant.weight) === Number(variant.weight) &&
        String(cartItem.variant.weightUnit) === String(variant.weightUnit) &&
        String(cartItem.variant.cleaningInstruction) ===
          String(variant.cleaningInstruction),
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({
        item: item._id,
        name: item.name,
        image: item.image,
        category: item.category,

        variant: {
          size: variant.size,
          weight: variant.weight,
          weightUnit: variant.weightUnit,
          cleaningInstruction: variant.cleaningInstruction,
        },

        price: Number(variant.price),
        quantity: qty,
      });
    }

    // Recalculate total
    cart.totalAmount = calculateTotal(cart.items);

    await cart.save();

    return res.status(200).json({
      message: "Item added to cart.",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      message: "Failed to add item to cart.",
      error: error.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(200).json({
        items: [],
        totalAmount: 0,
      });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      message: "Failed to get cart.",
      error: error.message,
    });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.userId;

    const { cartItemId, quantity } = req.body;

    if (!cartItemId || quantity === undefined) {
      return res.status(400).json({
        message: "Cart item ID and quantity are required.",
      });
    }

    const newQuantity = Number(quantity);

    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    const cartItem = cart.items.id(cartItemId);

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found.",
      });
    }

    // Update quantity
    cartItem.quantity = newQuantity;

    // Recalculate total
    cart.totalAmount = calculateTotal(cart.items);

    await cart.save();

    return res.status(200).json({
      message: "Cart quantity updated.",
      cart,
    });
  } catch (error) {
    console.error("Update cart quantity error:", error);

    return res.status(500).json({
      message: "Failed to update cart quantity.",
      error: error.message,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItemId } = req.params;

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found.",
      });
    }

    const cartItem = cart.items.id(cartItemId);

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found.",
      });
    }

    // Explicitly remove subdocument
    cart.items.pull(cartItemId);

    // Recalculate total
    cart.totalAmount = calculateTotal(cart.items);

    await cart.save();

    return res.status(200).json({
      message: "Item removed from cart.",
      cart,
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    return res.status(500).json({
      message: "Failed to remove item from cart.",
      error: error.message,
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart already empty",
      });
    }

    cart.items = [];
    cart.totalAmount = 0;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};
