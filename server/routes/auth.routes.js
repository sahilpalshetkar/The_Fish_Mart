import express from "express";
import {
  resetPassword,
  sendOtp,
  signIn,
  signOut,
  signUp,
  verifyOtp,
} from "../controllers/auth.controllers.js";
import {
  authRateLimit,
  otpSendRateLimit,
  otpVerifyRateLimit,
} from "../middlewares/rateLimit.js";

const authRouter = express.Router();

authRouter.post("/signup", authRateLimit, signUp);
authRouter.post("/signin", authRateLimit, signIn);
authRouter.get("/signout", signOut);

authRouter.post("/send-otp", otpSendRateLimit, sendOtp);
authRouter.post("/verify-otp", otpVerifyRateLimit, verifyOtp);
authRouter.post("/reset-password", authRateLimit, resetPassword);

export default authRouter;
