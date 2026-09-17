import express from "express";

import {
  getAreaAnalytics,
  getCategoryAnalytics,
  getMonthlyAnalytics,
  getPaymentAnalytics,
  getProductAnalytics,
  getSalesAnalytics,
} from "../controllers/analytics.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const analyticsRouter = express.Router();

analyticsRouter.get("/sales", isAuth, allowRoles("admin"), getSalesAnalytics);

analyticsRouter.get(
  "/monthly",
  isAuth,
  allowRoles("admin"),
  getMonthlyAnalytics,
);

analyticsRouter.get(
  "/products",
  isAuth,
  allowRoles("admin"),
  getProductAnalytics,
);

analyticsRouter.get(
  "/categories",
  isAuth,
  allowRoles("admin"),
  getCategoryAnalytics,
);

analyticsRouter.get(
  "/payments",
  isAuth,
  allowRoles("admin"),
  getPaymentAnalytics,
);

analyticsRouter.get("/areas", isAuth, allowRoles("admin"), getAreaAnalytics);

export default analyticsRouter;
