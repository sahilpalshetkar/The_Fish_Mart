import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  acceptOrder,
  cancelOrder,
  completeAnalytics,
  getCurrentOrder,
  getDeliveryBoyAssignments,
  getMyOrders,
  getOrderById,
  getOwnerOrders,
  getTodayDeliveries,
  placeOrder,
  releaseExpiredReservations,
  releaseExpiredReservationsInternal,
  sendDeliveryOtp,
  updateDeliveryStatus,
  updateOrderStatus,
  verifyDeliveryOtp,
  verifyPayment,
} from "../controllers/order.controllers.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.post("/verify-payment", isAuth, verifyPayment);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/get/:orderId", isAuth, getOrderById);
orderRouter.get("/owner-orders", isAuth, allowRoles("admin"), getOwnerOrders);
orderRouter.put(
  "/update-status/:orderId",
  isAuth,
  allowRoles("admin"),
  updateOrderStatus,
);
orderRouter.put(
  "/update-delivery-status/:orderId",
  isAuth,
  allowRoles("deliveryBoy"),
  updateDeliveryStatus,
);
orderRouter.get(
  "/get-assignments",
  isAuth,
  allowRoles("deliveryBoy"),
  getDeliveryBoyAssignments,
);
orderRouter.get(
  "/get-current-order",
  isAuth,
  allowRoles("deliveryBoy"),
  getCurrentOrder,
);
orderRouter.put(
  "/accept-order/:assignmentId",
  isAuth,
  allowRoles("deliveryBoy"),
  acceptOrder,
);
orderRouter.put(
  "/update-delivery-status/:orderId",
  isAuth,
  allowRoles("deliveryBoy"),
  updateOrderStatus,
);
orderRouter.post(
  "/send-delivery-otp",
  isAuth,
  allowRoles("deliveryBoy"),
  sendDeliveryOtp,
);
orderRouter.post(
  "/verify-delivery-otp",
  isAuth,
  allowRoles("deliveryBoy"),
  verifyDeliveryOtp,
);
orderRouter.get(
  "/get-today-deliveries",
  isAuth,
  allowRoles("deliveryBoy"),
  getTodayDeliveries,
);

orderRouter.put("/cancel/:orderId", isAuth, cancelOrder);

orderRouter.get(
  "/complete-analytics",
  isAuth,
  allowRoles("admin"),
  completeAnalytics,
);

orderRouter.post(
  "/release-expired-reservations",
  isAuth,
  allowRoles("admin"),
  releaseExpiredReservations,
);

orderRouter.post(
  "/internal/release-expired-reservations",
  releaseExpiredReservationsInternal,
);

export default orderRouter;
