import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Razorpay from "razorpay";
import DeliveryPincode from "../models/DeliveryPincode.js";
import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import User from "../models/user.model.js";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    // =========================
    // BASIC VALIDATION
    // =========================

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!["cod", "online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    const pincode = String(deliveryAddress.pincode || "").trim();

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode",
      });
    }

    // =========================
    // CHECK PINCODE
    // =========================

    const serviceablePincode = await DeliveryPincode.findOne({
      pincode,
      isActive: true,
    });

    if (!serviceablePincode) {
      return res.status(400).json({
        success: false,
        message: "Sorry, we don't deliver to this pincode.",
      });
    }

    // =========================
    // CALCULATE SUBTOTAL
    // =========================

    const subtotal = cartItems.reduce((sum, cartItem) => {
      const price = Number(cartItem.price || 0);
      const quantity = Number(cartItem.quantity || 0);

      return sum + price * quantity;
    }, 0);

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    // =========================
    // DELIVERY FEE
    // =========================

    const deliveryFee = 0;

    const orderTotal = subtotal + deliveryFee;

    // =========================
    // VERIFY PRODUCTS
    // =========================

    const orderItems = [];

    for (const cartItem of cartItems) {
      if (!cartItem.item) {
        return res.status(400).json({
          success: false,
          message: "Item information is missing",
        });
      }

      const product = await Item.findById(cartItem.item);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${cartItem.name || cartItem.item}`,
        });
      }

      // =========================
      // BUILD ORDER ITEM
      // =========================

      orderItems.push({
        item: product._id,

        name: cartItem.name || product.name,

        image: cartItem.image || product.image || "",

        category: cartItem.category || product.category || "",

        variant: {
          size: cartItem.variant?.size || "",
          weight: Number(cartItem.variant?.weight || 0),
          weightUnit: cartItem.variant?.weightUnit || "kg",
          cleaningInstruction: cartItem.variant?.cleaningInstruction || "",
        },

        price: Number(cartItem.price),

        quantity: Number(cartItem.quantity),
      });
    }

    // =========================
    // DELIVERY ADDRESS
    // =========================

    const finalDeliveryAddress = {
      fullName: deliveryAddress.fullName,
      mobile: deliveryAddress.mobile,
      email: deliveryAddress.email || "",

      address: deliveryAddress.address,

      landmark: deliveryAddress.landmark || "",

      city: deliveryAddress.city,

      state: deliveryAddress.state,

      pincode,
    };

    // =========================
    // ONLINE PAYMENT
    // =========================

    if (paymentMethod === "online") {
      const razorOrder = await instance.orders.create({
        amount: Math.round(orderTotal * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      const newOrder = await Order.create({
        user: req.userId,

        items: orderItems,

        subtotal,

        deliveryFee,

        totalAmount: orderTotal,

        deliveryAddress: finalDeliveryAddress,

        paymentMethod: "ONLINE",

        paymentStatus: "pending",

        orderStatus: "pending",

        razorpayOrderId: razorOrder.id,

        razorpayPaymentId: null,
      });

      // Populate before sending
      await newOrder.populate("items.item", "name image price category");

      await newOrder.populate("user", "fullName email mobile");

      return res.status(200).json({
        success: true,
        message: "Razorpay order created",

        razorOrder,

        orderId: newOrder._id,

        order: newOrder,
      });
    }

    // =========================
    // COD ORDER
    // =========================

    const newOrder = await Order.create({
      user: req.userId,

      items: orderItems,

      subtotal,

      deliveryFee,

      totalAmount: orderTotal,

      deliveryAddress: finalDeliveryAddress,

      paymentMethod: "COD",

      paymentStatus: "pending",

      orderStatus: "pending",
    });

    // =========================
    // POPULATE
    // =========================

    await newOrder.populate("items.item", "name image price category");

    await newOrder.populate("user", "fullName email mobile");

    // =========================
    // RESPONSE
    // =========================

    return res.status(201).json({
      success: true,

      message: "Order placed successfully",

      order: newOrder,
    });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Something went wrong while placing order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;

    // =========================
    // VALIDATE
    // =========================

    if (!razorpay_payment_id || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and order ID are required",
      });
    }

    // =========================
    // CHECK PAYMENT
    // =========================

    const payment = await instance.payments.fetch(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment not captured",
      });
    }

    // =========================
    // FIND ORDER
    // =========================

    const order = await Order.findOne({
      _id: orderId,
      user: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // =========================
    // PREVENT DUPLICATE
    // =========================

    if (order.paymentStatus === "paid") {
      await order.populate("items.item", "name image price category");

      await order.populate("user", "fullName email mobile");

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    // =========================
    // UPDATE PAYMENT
    // =========================

    order.paymentStatus = "paid";

    order.razorpayPaymentId = razorpay_payment_id;

    order.orderStatus = "confirmed";

    await order.save();

    // =========================
    // POPULATE
    // =========================

    await order.populate("items.item", "name image price category");

    await order.populate("user", "fullName email mobile");

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,

      message: "Payment verified successfully",

      order,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Payment verification failed",
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.userId,
    })
      .populate("items.item", "name image price category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get orders.",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.userId,
    }).populate("items.item", "name image price category");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get order.",
      error: error.message,
    });
  }
};

// export const cancelOrder = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { orderId } = req.params;

//     const order = await Order.findOne({
//       _id: orderId,
//       user: userId,
//     });

//     if (!order) {
//       return res.status(404).json({
//         message: "Order not found.",
//       });
//     }

//     // Don't allow cancellation after delivery starts
//     if (
//       ["shipped", "out_for_delivery", "delivered"].includes(order.orderStatus)
//     ) {
//       return res.status(400).json({
//         message: "This order can no longer be cancelled.",
//       });
//     }

//     order.orderStatus = "cancelled";

//     await order.save();

//     return res.status(200).json({
//       message: "Order cancelled successfully.",
//       order,
//     });
//   } catch (error) {
//     console.error("Cancel order error:", error);

//     return res.status(500).json({
//       message: "Failed to cancel order.",
//       error: error.message,
//     });
//   }
// };

export const getOwnerOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ message: `get all orders error ${error}` });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const adminId = req.userId;

    // ==============================
    // VALIDATE ORDER ID
    // ==============================
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // ==============================
    // VALIDATE STATUS
    // ==============================
    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // ==============================
    // FIND ADMIN SHOP
    // ==============================
    const shops = await Shop.find({
      owner: adminId,
    }).select("_id name items");

    if (!shops.length) {
      return res.status(403).json({
        success: false,
        message: "You do not have any shop",
      });
    }

    // ==============================
    // FIND ORDER
    // ==============================
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==============================
    // CHECK ADMIN OWNS ORDER ITEM
    // ==============================
    const orderContainsAdminItem = order.items.some((orderItem) => {
      return shops.some((shop) =>
        shop.items.some(
          (shopItemId) => String(shopItemId) === String(orderItem.item),
        ),
      );
    });

    if (!orderContainsAdminItem) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this order",
      });
    }

    // ==============================
    // PREVENT INVALID UPDATES
    // ==============================
    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be updated",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be updated",
      });
    }

    if (order.orderStatus === "out_for_delivery") {
      return res.status(400).json({
        success: false,
        message: "Order is already out for delivery",
      });
    }

    // ==============================
    // STATUS FLOW
    // ==============================
    const nextStatus = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "ready",
      ready: "out_for_delivery",
    };

    const currentStatus = order.orderStatus || "pending";

    if (status !== currentStatus && nextStatus[currentStatus] !== status) {
      return res.status(400).json({
        success: false,
        message: `Order can only move from ${currentStatus} to ${
          nextStatus[currentStatus] || "next status"
        }`,
      });
    }

    // ==============================
    // UPDATE ORDER STATUS
    // ==============================
    order.orderStatus = status;

    if (status === "confirmed" && order.paymentMethod === "COD") {
      order.paymentStatus = "pending";
    }

    // ==============================
    // DELIVERY ASSIGNMENT
    // ==============================
    let assignment = null;
    let availableBoys = [];

    if (status === "out_for_delivery") {
      // Get ALL delivery boys
      const deliveryBoys = await User.find({
        role: "deliveryBoy",
      }).select("_id fullName email mobile location");

      if (!deliveryBoys.length) {
        await order.save();

        return res.status(200).json({
          success: true,
          message: "Order status updated but no delivery boys are registered",
          order,
        });
      }

      // IDs of all delivery boys
      const deliveryBoyIds = deliveryBoys.map((boy) => boy._id);

      // Find delivery boys who are currently busy
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: deliveryBoyIds },
        status: {
          $in: ["assigned", "accepted", "picked_up"],
        },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));

      // Remove busy delivery boys
      availableBoys = deliveryBoys.filter(
        (boy) => !busyIdSet.has(String(boy._id)),
      );

      // IDs of available delivery boys
      const candidates = availableBoys.map((boy) => boy._id);

      // ==============================
      // NO AVAILABLE DELIVERY BOYS
      // ==============================
      if (!candidates.length) {
        await order.save();

        return res.status(200).json({
          success: true,
          message:
            "Order status updated but there are no available delivery boys",
          order,
          availableBoys: [],
        });
      }

      // ==============================
      // CREATE DELIVERY ASSIGNMENT
      // ==============================
      assignment = await DeliveryAssignment.create({
        order: order._id,
        broadcastedTo: candidates,
        status: "pending",
      });

      // Save assignment on order
      order.assignment = assignment._id;
    }

    // ==============================
    // SAVE ORDER
    // ==============================
    await order.save();

    // ==============================
    // GET UPDATED ORDER
    // ==============================
    const updatedOrder = await Order.findById(order._id)
      .populate("user", "fullName email mobile")
      .populate("items.item", "name image category");

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,

      assignment: assignment
        ? {
            _id: assignment._id,
            order: assignment.order,
            broadcastedTo: assignment.broadcastedTo,
            status: assignment.status,
          }
        : null,

      availableBoys: availableBoys.map((boy) => ({
        id: boy._id,
        fullName: boy.fullName,
        email: boy.email,
        mobile: boy.mobile,
      })),
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

export const getDeliveryBoyAssignments = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    const assignments = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "pending",
      assignedTo: null,
    })
      .populate({
        path: "order",
        populate: {
          path: "user",
          select: "fullName mobile email",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Get delivery boy assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get delivery assignments",
      error: error.message,
    });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    const assignment = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyId,
      status: {
        $in: ["assigned", "accepted", "picked_up"],
      },
    }).populate({
      path: "order",
      populate: {
        path: "user",
        select: "fullName email mobile",
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "No current order found",
      });
    }

    if (!assignment.order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
      order: assignment.order,
    });
  } catch (error) {
    console.error("Get current order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get current order",
      error: error.message,
    });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const deliveryBoyId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    // Find the assignment
    const assignment = await DeliveryAssignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Delivery assignment not found",
      });
    }

    // Check whether this delivery boy received the assignment
    const isBroadcastedToDeliveryBoy = assignment.broadcastedTo?.some(
      (id) => String(id) === String(deliveryBoyId),
    );

    if (!isBroadcastedToDeliveryBoy) {
      return res.status(403).json({
        success: false,
        message: "This delivery is not available to you",
      });
    }

    // Someone else already accepted it
    if (assignment.status !== "pending" || assignment.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "This delivery has already been accepted",
      });
    }

    // Check if delivery boy already has an active assignment
    const existingAssignment = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyId,
      status: {
        $in: ["assigned", "accepted", "picked_up"],
      },
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "You already have an active delivery",
      });
    }

    // Assign this order to delivery boy
    assignment.assignedTo = deliveryBoyId;
    assignment.status = "accepted";
    assignment.assignedAt = new Date();
    assignment.acceptedAt = new Date();

    await assignment.save();

    // Populate order details
    const updatedAssignment = await DeliveryAssignment.findById(assignment._id)
      .populate({
        path: "order",
        populate: {
          path: "user",
          select: "fullName email mobile",
        },
      })
      .populate("assignedTo", "fullName email mobile location");

    return res.status(200).json({
      success: true,
      message: "Delivery accepted successfully",
      assignment: updatedAssignment,
      order: updatedAssignment.order,
    });
  } catch (error) {
    console.error("Accept delivery error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to accept delivery",
      error: error.message,
    });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const deliveryBoyId = req.userId;

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Only these status changes are allowed from delivery boy
    if (!["picked_up"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status",
      });
    }

    // Find assignment belonging to this delivery boy
    const assignment = await DeliveryAssignment.findOne({
      order: orderId,
      assignedTo: deliveryBoyId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Delivery assignment not found",
      });
    }

    // Assignment must be accepted before pickup
    if (assignment.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: `Cannot mark order as picked up from ${assignment.status} status`,
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Order must be out_for_delivery
    if (order.orderStatus !== "out_for_delivery") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be picked up from ${order.orderStatus} status`,
      });
    }

    // Update assignment
    assignment.status = "picked_up";

    await assignment.save();

    // Update order
    order.orderStatus = "picked_up";

    await order.save();

    // Populate updated assignment
    const updatedAssignment = await DeliveryAssignment.findById(assignment._id)
      .populate({
        path: "order",
        populate: {
          path: "user",
          select: "fullName email mobile",
        },
      })
      .populate("assignedTo", "fullName email mobile location");

    return res.status(200).json({
      success: true,
      message: "Order marked as picked up",
      assignment: updatedAssignment,
      order: updatedAssignment.order,
    });
  } catch (error) {
    console.error("Update delivery status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update delivery status",
      error: error.message,
    });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId } = req.body;
    const deliveryBoyId = req.userId;

    // Validate order ID
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find delivery assignment
    const assignment = await DeliveryAssignment.findOne({
      order: orderId,
      assignedTo: deliveryBoyId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Delivery assignment not found",
      });
    }

    // OTP can only be sent after pickup
    if (assignment.status !== "picked_up") {
      return res.status(400).json({
        success: false,
        message: "OTP can only be sent after picking up the order",
      });
    }

    // Find order and customer
    const order = await Order.findById(orderId).populate(
      "user",
      "fullName mobile email",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!order.user.mobile) {
      return res.status(400).json({
        success: false,
        message: "Customer mobile number not found",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP
    order.deliveryOtp = otp;
    order.deliveryOtpExpiresAt = expiresAt;

    await order.save();
    await sendDeliveryOtpMail(order.user, otp);

    console.log(`Delivery OTP for order ${order._id}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "Delivery OTP sent successfully",
      expiresAt,
    });
  } catch (error) {
    console.error("Send delivery OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send delivery OTP",
      error: error.message,
    });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const deliveryBoyId = req.userId;

    // Validate order ID
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Validate OTP
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }

    // Find assignment belonging to this delivery boy
    const assignment = await DeliveryAssignment.findOne({
      order: orderId,
      assignedTo: deliveryBoyId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Delivery assignment not found",
      });
    }

    // OTP verification only after pickup
    if (assignment.status !== "picked_up") {
      return res.status(400).json({
        success: false,
        message: "Order must be picked up before delivery",
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check OTP exists
    if (!order.deliveryOtp) {
      return res.status(400).json({
        success: false,
        message: "No delivery OTP has been generated",
      });
    }

    // Check OTP expiry
    if (
      !order.deliveryOtpExpiresAt ||
      new Date() > new Date(order.deliveryOtpExpiresAt)
    ) {
      // Clear expired OTP
      order.deliveryOtp = null;
      order.deliveryOtpExpiresAt = null;

      await order.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    // Compare OTP
    if (cleanOtp !== String(order.deliveryOtp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // =====================================================
    // OTP IS CORRECT
    // =====================================================

    // Update order
    order.orderStatus = "delivered";

    // Clear OTP after successful verification
    order.deliveryOtp = null;
    order.deliveryOtpExpiresAt = null;

    await order.save();

    // Update delivery assignment
    assignment.status = "delivered";
    assignment.deliveredAt = new Date();

    await assignment.save();

    // Get updated data
    const updatedAssignment = await DeliveryAssignment.findById(assignment._id)
      .populate({
        path: "order",
        populate: {
          path: "user",
          select: "fullName email mobile",
        },
      })
      .populate("assignedTo", "fullName email mobile location");

    return res.status(200).json({
      success: true,
      message: "Order delivered successfully",
      assignment: updatedAssignment,
      order: updatedAssignment.order,
    });
  } catch (error) {
    console.error("Verify delivery OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify delivery OTP",
      error: error.message,
    });
  }
};

export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    // Start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Start of tomorrow
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const deliveries = await DeliveryAssignment.aggregate([
      {
        $match: {
          assignedTo: new mongoose.Types.ObjectId(deliveryBoyId),
          status: "delivered",
          deliveredAt: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        },
      },

      {
        $group: {
          _id: {
            hour: {
              $hour: "$deliveredAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          _id: 0,
          hour: "$_id.hour",
          count: 1,
        },
      },

      {
        $sort: {
          hour: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      deliveries,
    });
  } catch (error) {
    console.error("Get today's deliveries error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get today's deliveries",
      error: error.message,
    });
  }
};
