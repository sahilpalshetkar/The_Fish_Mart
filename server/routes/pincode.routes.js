import express from "express";
import { checkPincode } from "../controllers/deliveryPincode.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const pincodeRouter = express.Router();

pincodeRouter.get("/check-pincode/:pincode", isAuth, checkPincode);

export default pincodeRouter;
