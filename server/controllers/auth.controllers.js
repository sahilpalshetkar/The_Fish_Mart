import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import genToken from "../utils/token.js";
import { sendAuthOtpEmail } from "../utils/mail.js";

const normalizeEmail = (email) => email?.trim().toLowerCase();

const hashValue = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const generateResetToken = () => crypto.randomBytes(32).toString("hex");

const sanitizeUser = (user) => {
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.resetOtp;
  delete userObject.otpExpires;
  delete userObject.otpAttempts;
  delete userObject.otpLastSentAt;
  delete userObject.resetTokenHash;
  delete userObject.resetTokenExpires;

  return userObject;
};

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!fullName?.trim() || !normalizedEmail || !password || !mobile) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    if (!/^\d{10}$/.test(String(mobile))) {
      return res.status(400).json({
        message: "Mobile number must be 10 digits",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      mobile: String(mobile),
    });

    const token = await genToken(user._id);

    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("SIGN UP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("SIGN IN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to sign in",
    });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("SIGN OUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to sign out",
    });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+resetOtp +otpExpires +otpAttempts +otpLastSentAt +resetTokenHash +resetTokenExpires",
    );

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, an OTP has been sent",
      });
    }

    const now = Date.now();

    if (user.otpLastSentAt && now - user.otpLastSentAt.getTime() < 60 * 1000) {
      const remainingSeconds = Math.ceil(
        (60 * 1000 - (now - user.otpLastSentAt.getTime())) / 1000,
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting another OTP`,
      });
    }

    const otp = generateOtp();
    const otpHash = hashValue(otp);

    user.resetOtp = otpHash;
    user.otpExpires = new Date(now + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();
    user.isOtpVerified = false;
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    try {
      await sendAuthOtpEmail(normalizedEmail, otp);
    } catch (error) {
      user.resetOtp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      user.otpLastSentAt = undefined;

      await user.save();

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "If an account exists, an OTP has been sent",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!normalizedEmail || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+resetOtp +otpExpires +otpAttempts +resetTokenHash +resetTokenExpires",
    );

    if (!user || !user.resetOtp || !user.otpExpires) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    if (user.otpExpires.getTime() < Date.now()) {
      user.resetOtp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;
      await user.save();

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP",
      });
    }

    const submittedOtpHash = hashValue(otp);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(user.resetOtp),
      Buffer.from(submittedOtpHash),
    );

    if (!isValid) {
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const resetToken = generateResetToken();

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.resetTokenHash = hashValue(resetToken);
    user.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword, resetToken } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const resetTokenHash = hashValue(resetToken);

    const user = await User.findOne({
      resetTokenHash,
      resetTokenExpires: { $gt: new Date() },
      isOtpVerified: true,
    }).select("+password +resetTokenHash +resetTokenExpires");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset session",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.isOtpVerified = false;
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};
