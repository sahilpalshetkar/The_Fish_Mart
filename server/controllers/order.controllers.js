import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order.model.js";
import DeliveryPincode from "../models/DeliveryPincode.js";
import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtpEmail } from "../utils/mail.js";
import RazorpayWebhookEvent from "../models/razorpayWebhookEvent.model.js";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const refundRazorpayPayment = async (paymentId, amount) => {
  return await instance.payments.refund(paymentId, {
    amount: Math.round(amount * 100),
  });
};

const allowedOrderTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["picked_up", "cancelled"],
  picked_up: ["delivered"],
  delivered: [],
  cancelled: [],
};

const isValidOrderTransition = (currentStatus, nextStatus) => {
  return allowedOrderTransitions[currentStatus]?.includes(nextStatus);
};

const normalizeWeightToKg = (weight, weightUnit) => {
  const value = Number(weight);
  if (weightUnit === "g") {
    return value / 1000;
  }
  return value;
};

const commitReservedStock = async (order, session) => {
  for (const orderItem of order.items) {
    const result = await Item.findOneAndUpdate(
      {
        _id: orderItem.item,
        variants: {
          $elemMatch: {
            _id: orderItem.variant._id,
            reservedWeight: {
              $gte: orderItem.requestedWeight,
            },
          },
        },
      },
      {
        $inc: {
          "variants.$.reservedWeight": -orderItem.requestedWeight,
          "variants.$.soldWeight": orderItem.requestedWeight,
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!result) {
      throw new Error(`STOCK_COMMIT_FAILED:${orderItem.name}`);
    }
  }
};

const releaseReservedStock = async (order, session) => {
  for (const orderItem of order.items) {
    const result = await Item.findOneAndUpdate(
      {
        _id: orderItem.item,
        variants: {
          $elemMatch: {
            _id: orderItem.variant._id,
            reservedWeight: {
              $gte: orderItem.requestedWeight,
            },
          },
        },
      },
      {
        $inc: {
          "variants.$.reservedWeight": -orderItem.requestedWeight,
          "variants.$.availableWeight": orderItem.requestedWeight,
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!result) {
      throw new Error(`STOCK_RELEASE_FAILED:${orderItem.name}`);
    }
  }
};

export const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { cartItems, paymentMethod, deliveryAddress } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
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

    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cartItems) {
      if (!cartItem.item) {
        return res.status(400).json({
          success: false,
          message: "Item information is missing",
        });
      }

      const quantity = Number(cartItem.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid item quantity",
        });
      }

      const product = await Item.findById(cartItem.item);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`,
        });
      }

      const requestedVariant = cartItem.variant;

      if (!requestedVariant) {
        return res.status(400).json({
          success: false,
          message: `Variant information is missing for ${product.name}`,
        });
      }

      const requestedSize = String(requestedVariant.size || "").trim();

      const requestedWeight = Number(requestedVariant.weight);

      const requestedWeightUnit = String(
        requestedVariant.weightUnit || "",
      ).trim();

      const requestedCleaningInstruction = String(
        requestedVariant.cleaningInstruction || "",
      ).trim();

      if (
        !Number.isFinite(requestedWeight) ||
        requestedWeight <= 0 ||
        !requestedWeightUnit
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid variant for ${product.name}`,
        });
      }

      const variant = product.variants.find((item) => {
        return (
          String(item.size || "").trim() === requestedSize &&
          Number(item.weight) === requestedWeight &&
          String(item.weightUnit || "").trim() === requestedWeightUnit &&
          String(item.cleaningInstruction || "").trim() ===
            requestedCleaningInstruction
        );
      });

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Selected variant is no longer available for ${product.name}`,
        });
      }

      if (!variant.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Selected variant of ${product.name} is unavailable`,
        });
      }

      const price = Number(variant.price);

      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}`,
        });
      }

      const variantWeightKg = normalizeWeightToKg(
        variant.weight,
        variant.weightUnit,
      );

      const totalRequestedWeight = variantWeightKg * quantity;

      if (!Number.isFinite(totalRequestedWeight) || totalRequestedWeight <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid requested weight for ${product.name}`,
        });
      }

      const itemTotal = price * quantity;

      subtotal += itemTotal;

      orderItems.push({
        item: product._id,
        name: product.name,
        image: product.image || "",
        category: product.category || "",

        variant: {
          _id: variant._id,
          size: variant.size || "",
          weight: Number(variant.weight),
          weightUnit: variant.weightUnit,
          cleaningInstruction: variant.cleaningInstruction || "",
        },

        price,
        unitPrice: price,
        quantity,
        requestedWeight: totalRequestedWeight,
        actualWeight: null,
        stockStatus: "reserved",
      });
    }

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const deliveryFee = 0;
    const orderTotal = subtotal + deliveryFee;

    const finalDeliveryAddress = {
      fullName: String(deliveryAddress.fullName || "").trim(),
      mobile: String(deliveryAddress.mobile || "").trim(),
      email: String(deliveryAddress.email || "").trim(),
      address: String(deliveryAddress.address || "").trim(),
      landmark: String(deliveryAddress.landmark || "").trim(),
      city: String(deliveryAddress.city || "").trim(),
      state: String(deliveryAddress.state || "").trim(),
      pincode,
    };

    if (
      !finalDeliveryAddress.fullName ||
      !finalDeliveryAddress.mobile ||
      !finalDeliveryAddress.address ||
      !finalDeliveryAddress.city ||
      !finalDeliveryAddress.state
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery address is required",
      });
    }

    let razorOrder = null;

    if (paymentMethod === "online") {
      razorOrder = await instance.orders.create({
        amount: Math.round(orderTotal * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
    }

    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    let newOrder;

    await session.withTransaction(async () => {
      for (const orderItem of orderItems) {
        const reservedItem = await Item.findOneAndUpdate(
          {
            _id: orderItem.item,
            variants: {
              $elemMatch: {
                _id: orderItem.variant._id,
                isAvailable: true,
                availableWeight: {
                  $gte: orderItem.requestedWeight,
                },
              },
            },
          },
          {
            $inc: {
              "variants.$.availableWeight": -orderItem.requestedWeight,
              "variants.$.reservedWeight": orderItem.requestedWeight,
            },
          },
          {
            new: true,
            session,
          },
        );

        if (!reservedItem) {
          throw new Error(`INSUFFICIENT_STOCK:${orderItem.name}`);
        }
      }

      const orderData = {
        user: req.userId,
        items: orderItems,
        subtotal,
        deliveryFee,
        totalAmount: orderTotal,
        deliveryAddress: finalDeliveryAddress,
        paymentMethod: paymentMethod === "online" ? "ONLINE" : "COD",
        paymentStatus: "pending",
        orderStatus: "pending",
        stockStatus: "reserved",
        stockReservedAt: new Date(),
        stockReservationExpiresAt: reservationExpiresAt,
      };

      if (razorOrder) {
        orderData.razorpayOrderId = razorOrder.id;
        orderData.razorpayPaymentId = null;
      }

      const createdOrders = await Order.create([orderData], {
        session,
      });

      newOrder = createdOrders[0];
    });

    await newOrder.populate("items.item", "name image price category");
    await newOrder.populate("user", "fullName email mobile");

    if (paymentMethod === "online") {
      return res.status(201).json({
        success: true,
        message: "Razorpay order created",
        razorOrder,
        orderId: newOrder._id,
        order: newOrder,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);

    if (error.message?.startsWith("INSUFFICIENT_STOCK:")) {
      const productName = error.message.split(":")[1];

      return res.status(409).json({
        success: false,
        message: `${productName} does not have enough stock.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while placing order",
    });
  } finally {
    await session.endSession();
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

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

    if (order.paymentMethod !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message: "This order is not an online payment order",
      });
    }

    if (!order.razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID is missing",
      });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay order ID",
      });
    }

    if (order.paymentStatus === "paid") {
      await order.populate("items.item", "name image price category");
      await order.populate("user", "fullName email mobile");

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const generatedSignatureBuffer = Buffer.from(generatedSignature, "utf8");

    const receivedSignatureBuffer = Buffer.from(razorpay_signature, "utf8");

    if (
      generatedSignatureBuffer.length !== receivedSignatureBuffer.length ||
      !crypto.timingSafeEqual(generatedSignatureBuffer, receivedSignatureBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const payment = await instance.payments.fetch(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment has not been captured",
      });
    }

    if (payment.order_id !== order.razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Payment does not belong to this order",
      });
    }

    if (payment.currency !== "INR") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment currency",
      });
    }

    const expectedAmount = Math.round(order.totalAmount * 100);

    if (Number(payment.amount) !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match order amount",
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findOne({
          _id: order._id,
          paymentStatus: { $ne: "paid" },
          stockStatus: "reserved",
        }).session(session);

        if (!currentOrder) {
          return;
        }

        await commitReservedStock(currentOrder, session);

        currentOrder.paymentStatus = "paid";
        currentOrder.razorpayPaymentId = razorpay_payment_id;
        currentOrder.orderStatus = "confirmed";
        currentOrder.stockStatus = "sold";

        currentOrder.items.forEach((item) => {
          item.stockStatus = "sold";
        });

        await currentOrder.save({ session });
      });
    } finally {
      await session.endSession();
    }

    await order.populate("items.item", "name image price category");
    await order.populate("user", "fullName email mobile");

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};

export const razorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const eventId = req.headers["x-razorpay-event-id"];

  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is missing");

    return res.status(500).json({
      success: false,
      message: "Webhook configuration error",
    });
  }

  if (!signature || !eventId) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook request",
    });
  }

  try {
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook body",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(String(signature), "utf8");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    let payload;

    try {
      payload = JSON.parse(req.body.toString("utf8"));
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook payload",
      });
    }

    const event = payload?.event;

    const allowedEvents = ["payment.captured", "payment.failed", "order.paid"];

    if (!allowedEvents.includes(event)) {
      return res.status(200).json({
        success: true,
        message: "Event ignored",
      });
    }

    const paymentEntity = payload?.payload?.payment?.entity || null;
    const orderEntity = payload?.payload?.order?.entity || null;

    const razorpayPaymentId = paymentEntity?.id || null;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id || null;

    let webhookEvent;

    try {
      webhookEvent = await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        {
          $setOnInsert: {
            eventId,
            event,
            status: "processing",
            razorpayOrderId,
            razorpayPaymentId,
          },
        },
        {
          upsert: true,
          new: true,
        },
      );
    } catch (error) {
      if (error.code === 11000) {
        webhookEvent = await RazorpayWebhookEvent.findOne({ eventId });
      } else {
        throw error;
      }
    }

    if (webhookEvent?.status === "processed") {
      return res.status(200).json({
        success: true,
        message: "Webhook already processed",
      });
    }

    if (event === "payment.failed") {
      if (razorpayOrderId) {
        const order = await Order.findOne({
          razorpayOrderId,
        });

        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "pending";
          await order.save();
        }
      }

      await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        {
          status: "processed",
          processedAt: new Date(),
        },
      );

      return res.status(200).json({
        success: true,
        message: "Payment attempt failed",
      });
    }

    if (!razorpayOrderId || !razorpayPaymentId) {
      await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        {
          status: "failed",
          errorMessage: "Payment order information is missing",
        },
      );

      return res.status(400).json({
        success: false,
        message: "Payment order information is missing",
      });
    }

    const order = await Order.findOne({
      razorpayOrderId,
    });

    if (!order) {
      await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        {
          status: "failed",
          errorMessage: "Order not found",
        },
      );

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus === "paid") {
      await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        {
          status: "processed",
          processedAt: new Date(),
        },
      );

      return res.status(200).json({
        success: true,
        message: "Order already marked as paid",
      });
    }

    const payment = await instance.payments.fetch(razorpayPaymentId);

    if (!payment || payment.status !== "captured") {
      await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        {
          status: "failed",
          errorMessage: "Payment is not captured",
        },
      );

      return res.status(400).json({
        success: false,
        message: "Payment is not captured",
      });
    }

    if (payment.order_id !== order.razorpayOrderId) {
      await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        {
          status: "failed",
          errorMessage: "Payment order mismatch",
        },
      );

      return res.status(400).json({
        success: false,
        message: "Payment order mismatch",
      });
    }

    if (payment.currency !== "INR") {
      await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        {
          status: "failed",
          errorMessage: "Payment currency mismatch",
        },
      );

      return res.status(400).json({
        success: false,
        message: "Payment currency mismatch",
      });
    }

    const expectedAmount = Math.round(order.totalAmount * 100);

    if (Number(payment.amount) !== expectedAmount) {
      await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        {
          status: "failed",
          errorMessage: "Payment amount mismatch",
        },
      );

      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch",
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findOne({
          _id: order._id,
          paymentStatus: { $ne: "paid" },
          stockStatus: "reserved",
        }).session(session);

        if (!currentOrder) {
          return;
        }

        await commitReservedStock(currentOrder, session);

        currentOrder.paymentStatus = "paid";
        currentOrder.razorpayPaymentId = razorpayPaymentId;
        currentOrder.orderStatus = "confirmed";
        currentOrder.stockStatus = "sold";

        currentOrder.items.forEach((item) => {
          item.stockStatus = "sold";
        });

        await currentOrder.save({ session });
      });
    } finally {
      await session.endSession();
    }

    await RazorpayWebhookEvent.findOneAndUpdate(
      { eventId },
      {
        status: "processed",
        processedAt: new Date(),
      },
    );

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("RAZORPAY WEBHOOK ERROR:", error);

    if (eventId) {
      await RazorpayWebhookEvent.findOneAndUpdate(
        { eventId },
        {
          status: "failed",
          errorMessage: error.message,
        },
      );
    }

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

export const releaseExpiredReservations = async (req, res) => {
  try {
    const expiredOrders = await Order.find({
      stockStatus: "reserved",
      paymentMethod: "ONLINE",
      paymentStatus: "pending",
      stockReservationExpiresAt: {
        $lt: new Date(),
      },
    });

    let releasedCount = 0;

    for (const order of expiredOrders) {
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const currentOrder = await Order.findOne({
            _id: order._id,
            stockStatus: "reserved",
            paymentMethod: "ONLINE",
            paymentStatus: "pending",
            stockReservationExpiresAt: {
              $lt: new Date(),
            },
          }).session(session);

          if (!currentOrder) {
            return;
          }

          await releaseReservedStock(currentOrder, session);

          currentOrder.stockStatus = "released";
          currentOrder.orderStatus = "cancelled";

          currentOrder.items.forEach((item) => {
            item.stockStatus = "released";
          });

          await currentOrder.save({ session });

          releasedCount += 1;
        });
      } finally {
        await session.endSession();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Expired reservations processed",
      releasedCount,
    });
  } catch (error) {
    console.error("RELEASE EXPIRED RESERVATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to release expired reservations",
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

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

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

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    if (
      ["shipped", "out_for_delivery", "picked_up", "delivered"].includes(
        order.orderStatus,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be cancelled",
      });
    }

    const isPaidOnline =
      order.paymentMethod === "ONLINE" && order.paymentStatus === "paid";

    if (isPaidOnline) {
      if (!order.razorpayPaymentId) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is missing. Refund cannot be processed.",
        });
      }

      if (order.refundStatus === "processed") {
        return res.status(400).json({
          success: false,
          message: "Refund has already been processed",
        });
      }

      order.refundStatus = "pending";
      await order.save();

      try {
        await refundRazorpayPayment(order.razorpayPaymentId, order.totalAmount);
      } catch (refundError) {
        console.error("RAZORPAY REFUND ERROR:", refundError);

        order.refundStatus = "failed";
        await order.save();

        return res.status(500).json({
          success: false,
          message: "Refund could not be processed. Order was not cancelled.",
        });
      }
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findOne({
          _id: orderId,
          user: req.userId,
          orderStatus: { $ne: "cancelled" },
        }).session(session);

        if (!currentOrder) {
          throw new Error("ORDER_ALREADY_CANCELLED");
        }

        if (currentOrder.stockStatus === "reserved") {
          await releaseReservedStock(currentOrder, session);

          currentOrder.stockStatus = "released";

          currentOrder.items.forEach((item) => {
            item.stockStatus = "released";
          });
        }

        currentOrder.orderStatus = "cancelled";

        if (
          currentOrder.paymentMethod === "ONLINE" &&
          currentOrder.paymentStatus === "paid"
        ) {
          currentOrder.paymentStatus = "refunded";
          currentOrder.refundStatus = "processed";
        }

        await currentOrder.save({ session });
      });
    } finally {
      await session.endSession();
    }

    const cancelledOrder = await Order.findById(orderId);

    await cancelledOrder.populate("items.item", "name image price category");

    return res.status(200).json({
      success: true,
      message: isPaidOnline
        ? "Order cancelled and refund processed successfully"
        : "Order cancelled successfully",
      order: cancelledOrder,
    });
  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);

    if (error.message === "ORDER_ALREADY_CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to cancel order",
    });
  }
};

//recent orders
export const getOwnerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: { $ne: "delivered" } }).sort(
      {
        updatedAt: -1,
      },
    );
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ message: `get all orders error ${error}` });
  }
};

export const completeAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: "delivered" })
      .populate("user", "fullName email mobile")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get completed orders error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get completed orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const adminId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

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

    const shops = await Shop.find({
      owner: adminId,
    }).select("_id name items");

    if (!shops.length) {
      return res.status(403).json({
        success: false,
        message: "You do not have any shop",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

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

    if (!isValidOrderTransition(order.orderStatus, status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.orderStatus} to ${status}`,
      });
    }

    order.orderStatus = status;

    if (status === "confirmed" && order.paymentMethod === "COD") {
      order.paymentStatus = "pending";
    }

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

      assignment = await DeliveryAssignment.create({
        order: order._id,
        broadcastedTo: candidates,
        status: "pending",
      });

      // Save assignment on order
      order.assignment = assignment._id;
    }

    await order.save();

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

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (status !== "picked_up") {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status",
      });
    }

    const session = await mongoose.startSession();

    let updatedAssignment;
    let updatedOrder;

    try {
      await session.withTransaction(async () => {
        const assignment = await DeliveryAssignment.findOne({
          order: orderId,
          assignedTo: deliveryBoyId,
        }).session(session);

        if (!assignment) {
          throw new Error("DELIVERY_ASSIGNMENT_NOT_FOUND");
        }

        if (assignment.status !== "accepted") {
          throw new Error(`INVALID_ASSIGNMENT_STATUS:${assignment.status}`);
        }

        const order = await Order.findById(orderId).session(session);

        if (!order) {
          throw new Error("ORDER_NOT_FOUND");
        }

        if (order.orderStatus !== "out_for_delivery") {
          throw new Error(`INVALID_ORDER_STATUS:${order.orderStatus}`);
        }

        assignment.status = "picked_up";
        await assignment.save({ session });

        order.orderStatus = "picked_up";
        await order.save({ session });

        updatedAssignment = assignment;
        updatedOrder = order;
      });
    } finally {
      await session.endSession();
    }

    updatedAssignment = await DeliveryAssignment.findById(updatedAssignment._id)
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

    if (error.message === "DELIVERY_ASSIGNMENT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Delivery assignment not found",
      });
    }

    if (error.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (error.message.startsWith("INVALID_ASSIGNMENT_STATUS:")) {
      const currentStatus = error.message.split(":")[1];

      return res.status(400).json({
        success: false,
        message: `Cannot mark order as picked up from ${currentStatus} status`,
      });
    }

    if (error.message.startsWith("INVALID_ORDER_STATUS:")) {
      const currentStatus = error.message.split(":")[1];

      return res.status(400).json({
        success: false,
        message: `Order cannot be picked up from ${currentStatus} status`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update delivery status",
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
    sendDeliveryOtpEmail(order.user, otp);
    // await sendDeliveryOtpEmail(order.user, otp);

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

    // Update order
    order.orderStatus = "delivered";

    // Clear OTP after successful verification
    order.deliveryOtp = null;
    order.deliveryOtpExpiresAt = null;

    //COD payment is collected at delivery
    if (order.paymentMethod === "COD") {
      order.paymentStatus = "paid";
    }

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

export const releaseExpiredReservationsInternal = async (req, res) => {
  try {
    const secret = req.headers["x-cron-secret"];

    if (!secret || secret !== process.env.CRON_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const expiredOrders = await Order.find({
      stockStatus: "reserved",
      paymentMethod: "ONLINE",
      paymentStatus: "pending",
      stockReservationExpiresAt: {
        $lt: new Date(),
      },
    });

    let releasedCount = 0;

    for (const order of expiredOrders) {
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const currentOrder = await Order.findOne({
            _id: order._id,
            stockStatus: "reserved",
            paymentMethod: "ONLINE",
            paymentStatus: "pending",
            stockReservationExpiresAt: {
              $lt: new Date(),
            },
          }).session(session);

          if (!currentOrder) {
            return;
          }

          await releaseReservedStock(currentOrder, session);

          currentOrder.stockStatus = "released";
          currentOrder.orderStatus = "cancelled";

          currentOrder.items.forEach((item) => {
            item.stockStatus = "released";
          });

          await currentOrder.save({ session });

          releasedCount += 1;
        });
      } finally {
        await session.endSession();
      }
    }

    return res.status(200).json({
      success: true,
      releasedCount,
    });
  } catch (error) {
    console.error("INTERNAL STOCK CLEANUP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Stock cleanup failed",
    });
  }
};
