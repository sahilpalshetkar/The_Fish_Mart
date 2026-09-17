import React, { useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaFish,
  FaLock,
  FaShieldHalved,
  FaCheck,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  //send otp
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setErr("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setErr("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setErr("");

      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true },
      );

      setStep(2);
    } catch (error) {
      console.error("Send OTP error:", error);
      setErr(
        error?.response?.data?.message ||
          "Unable to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  //verify otp
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErr("Please enter the OTP.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setErr("Please enter a valid 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      setErr("");
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true },
      );
      setResetToken(result.data.resetToken);
      setStep(3);
    } catch (error) {
      console.error("Verify OTP error:", error);
      setErr(
        error?.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  //reset password
  const handleResetPassword = async () => {
    if (!newPassword) {
      setErr("Please enter your new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters long.");
      return;
    }
    if (!confirmPassword) {
      setErr("Please confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      setErr("");
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        {
          resetToken,
          newPassword,
        },
        {
          withCredentials: true,
        },
      );
      navigate("/signin");
    } catch (error) {
      console.error("Reset password error:", error);
      setErr(
        error?.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  //back
  const handleBack = () => {
    setErr("");
    if (step === 1) {
      navigate("/signin");
    } else {
      setStep(step - 1);
    }
  };

  //steps
  const stepData = {
    1: {
      title: "Forgot your password?",
      description:
        "Enter the email address associated with your account and we'll send you a verification code.",
      label: "PASSWORD RECOVERY",
    },
    2: {
      title: "Verify your email",
      description: `We've sent a 6-digit verification code to ${email}.`,
      label: "EMAIL VERIFICATION",
    },
    3: {
      title: "Create new password",
      description: "Choose a strong password that you haven't used before.",
      label: "NEW PASSWORD",
    },
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(3,105,161,0.12)] overflow-hidden flex flex-col lg:flex-row">
        {/* left side */}
        <div className="hidden lg:flex lg:w-[45%] relative bg-[#F0F9FF] overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-28 -left-28 w-80 h-80 bg-[#0284C7]/5 rounded-full" />
          <div className="absolute top-32 -right-32 w-96 h-96 bg-[#0284C7]/5 rounded-full" />
          <div className="absolute -bottom-40 -left-20 w-112.5 h-112.5 bg-[#0369A1]/5 rounded-full" />
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full text-[#0369A1]">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <FaFish className="text-[#0284C7] text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Fish Company
                  </h1>
                  <p className="text-xs text-[#0284C7]/70">
                    Fresh from the sea. Delivered to you.
                  </p>
                </div>
              </div>
            </div>
            {/* Main */}
            <div className="my-10">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-6">
                <FaShieldHalved className="text-[#0284C7] text-2xl" />
              </div>
              <p className="text-[#0284C7]/70 text-sm font-semibold mb-4 tracking-wide">
                ACCOUNT SECURITY
              </p>
              <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
                Let's get you
                <br />
                back in.
              </h2>
              <p className="mt-6 text-[#0369A1]/70 text-base leading-relaxed max-w-md">
                Forgot your password? No worries. We'll help you securely
                recover your account and get you back to enjoying fresh fish.
              </p>
              {/* Benefits */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaCheck className="text-[#0284C7] text-sm" />
                  </div>
                  <span className="text-sm font-medium">
                    Secure account recovery
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaCheck className="text-[#0284C7] text-sm" />
                  </div>
                  <span className="text-sm font-medium">
                    Email verification
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaCheck className="text-[#0284C7] text-sm" />
                  </div>
                  <span className="text-sm font-medium">
                    Protected password reset
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-sm text-[#0284C7]/60">
              © {new Date().getFullYear()} Fish Company. All rights reserved.
            </div>
          </div>
        </div>

        {/* right side */}
        <div className="w-full lg:w-[55%] px-6 py-8 sm:px-10 lg:px-14 xl:px-16">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
              <FaFish className="text-[#0284C7]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fish Company</h1>
              <p className="text-xs text-gray-500">
                Fresh from the sea. Delivered to you.
              </p>
            </div>
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0369A1] transition mb-8"
          >
            <FaArrowLeft className="text-xs" />
            {step === 1 ? "Back to Sign In" : "Back"}
          </button>

          {/* step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((item) => (
              <React.Fragment key={item}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= item
                      ? "bg-[#0284C7] text-white"
                      : "bg-[#E0F2FE] text-[#7DD3FC]"
                  }`}
                >
                  {step > item ? <FaCheck className="text-[10px]" /> : item}
                </div>

                {item !== 3 && (
                  <div
                    className={`h-1 flex-1 rounded-full transition-all ${
                      step > item ? "bg-[#0284C7]" : "bg-[#E0F2FE]"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-[#0284C7] text-sm font-semibold mb-2">
              {stepData[step].label}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {stepData[step].title}
            </h2>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-md">
              {stepData[step].description}
            </p>
          </div>

          {/* Error */}
          {err && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {err}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErr("");
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full h-13 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#0369A1] focus:ring-4 focus:ring-[#0369A1]/10"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full h-13 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-[#7DD3FC] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0284C7]/20 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <ClipLoader size={20} color="white" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <FaArrowRight className="text-sm" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    if (value.length <= 6) {
                      setOtp(value);
                    }

                    setErr("");
                  }}
                  placeholder="Enter 4-digit OTP"
                  className="w-full h-13 px-4 text-center text-sm tracking-[0.5em] font-semibold rounded-xl border border-gray-200 bg-gray-50 text-[#0369A1] outline-none transition-all focus:bg-white focus:border-[#0369A1] focus:ring-4 focus:ring-[#0369A1]/10"
                />

                <p className="text-xs text-gray-400 mt-2">
                  Check your inbox for the verification code.
                </p>
              </div>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full h-13 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-[#7DD3FC] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0284C7]/20 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <ClipLoader size={20} color="white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <FaArrowRight className="text-sm" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full text-sm font-semibold text-[#0284C7] hover:text-[#0369A1] hover:underline"
              >
                Didn't receive the code? Send again
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* New password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErr("");
                    }}
                    placeholder="Enter new password"
                    className="w-full h-13 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#0369A1] focus:ring-4 focus:ring-[#0369A1]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0369A1]"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErr("");
                    }}
                    placeholder="Confirm your password"
                    className="w-full h-13 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#0369A1] focus:ring-4 focus:ring-[#0369A1]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0369A1]"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Password requirement */}
              <div className="p-4 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]">
                <div className="flex gap-3">
                  <FaShieldHalved className="text-[#0284C7] mt-0.5 shrink-0" />

                  <div>
                    <p className="text-sm font-semibold text-[#0369A1]">
                      Password requirements
                    </p>

                    <p className="text-xs text-[#0369A1]/60 mt-1">
                      Use at least 6 characters for your new password.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full h-13 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-[#7DD3FC] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0284C7]/20 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <ClipLoader size={20} color="white" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <FaArrowRight className="text-sm" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Bottom */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="font-semibold text-[#0284C7] hover:text-[#0369A1] hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
