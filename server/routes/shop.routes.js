import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import {
  createEditShop,
  getMyShop,
  updateShopStatus,
} from "../controllers/shop.controllers.js";
import { upload } from "../middlewares/multer.js";

const shopRouter = express.Router();

shopRouter.post(
  "/create-edit",
  isAuth,
  allowRoles("admin"),
  upload.single("image"),
  createEditShop,
);
shopRouter.get("/get-my-shop", isAuth, allowRoles("admin"), getMyShop);
shopRouter.put("/update-status", isAuth, allowRoles("admin"), updateShopStatus);

export default shopRouter;
