import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { upload } from "../middlewares/multer.js";
import {
  addItem,
  deleteItem,
  editItem,
  getAllItems,
  getBestSellerItems,
  getItemById,
  updateItemAvailability,
} from "../controllers/item.controllers.js";

const itemRouter = express.Router();

itemRouter.post(
  "/add-item",
  isAuth,
  allowRoles("admin"),
  upload.single("image"),
  addItem,
);

itemRouter.post(
  "/edit-item/:itemId",
  isAuth,
  allowRoles("admin"),
  upload.single("image"),
  editItem,
);

itemRouter.get("/get-by-id/:itemId", isAuth, getItemById);
itemRouter.get("/delete/:itemId", isAuth, allowRoles("admin"), deleteItem);
itemRouter.patch(
  "/update-availability/:itemId",
  isAuth,
  allowRoles("admin"),
  updateItemAvailability,
);

itemRouter.get("/best-sellers", isAuth, getBestSellerItems);
itemRouter.get("/get-all-items", isAuth, getAllItems);

export default itemRouter;
