import express from "express";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const cartRouter = express.Router();

cartRouter.post("/add", isAuth, addToCart);
cartRouter.get("/get", isAuth, getCart);
cartRouter.put("/quantity", isAuth, updateCartQuantity);
cartRouter.delete("/remove/:cartItemId", isAuth, removeFromCart);
cartRouter.delete("/clear", isAuth, clearCart);

export default cartRouter;
