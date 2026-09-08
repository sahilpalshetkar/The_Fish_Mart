import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaFish,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa6";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!formData.password) {
      setError("Please enter your password.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      setError("");
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        formData,
        {
          withCredentials: true,
        },
      );
      dispatch(setUserData(result.data));
      navigate("/");
    } catch (error) {
      console.error("Signin error:", error);
      setError(
        error?.response?.data?.message ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(3,105,161,0.12)] overflow-hidden flex flex-col lg:flex-row">
        {/* left side*/}
        <div className="hidden lg:flex lg:w-[45%] relative bg-[#F0F9FF] overflow-hidden">
          {/* Ocean waves / decorative circles */}
          <div className="absolute -top-28 -left-28 w-80 h-80 bg-[#0284C7]/5 rounded-full" />
          <div className="absolute top-32 -right-32 w-96 h-96 bg-[#0284C7]/5 rounded-full" />
          <div className="absolute -bottom-40 -left-20 w-112.5 h-112.5 bg-[#0369A1]/5 rounded-full" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#0284C7]/5 rounded-t-[50%]" />
          <div className="relative z-10 flex flex-col justify-between p-12 w-full text-[#0369A1]">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <FaFish className="text-[#0284C7] text-xl" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    The Fishy Mart
                  </h1>

                  <p className="text-xs text-[#0284C7]/70">
                    Fresh from the sea. Delivered to you.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}

            <div className="my-10">
              <p className="text-[#0284C7]/70 text-sm font-semibold mb-4 tracking-wide">
                WELCOME BACK TO THE COAST
              </p>

              <h2 className="text-4xl xl:text-5xl font-bold leading-tight text-[#0369A1]">
                Fresh from
                <br />
                the ocean.
              </h2>

              <p className="mt-6 text-[#0369A1]/70 text-base leading-relaxed max-w-md">
                Sign in to explore fresh fish sourced from the docks and
                delivered straight to your doorstep.
              </p>

              {/* Benefits */}

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaCheck className="text-[#0284C7] text-sm" />
                  </div>

                  <span className="text-sm font-medium text-[#0369A1]">
                    Fresh fish sourced from local docks
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaCheck className="text-[#0284C7] text-sm" />
                  </div>

                  <span className="text-sm font-medium text-[#0369A1]">
                    Carefully handled and delivered fresh
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FaCheck className="text-[#0284C7] text-sm" />
                  </div>

                  <span className="text-sm font-medium text-[#0369A1]">
                    Fast and reliable doorstep delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom */}

            <div className="text-sm text-[#0284C7]/60">
              © {new Date().getFullYear()} The Fishy Mart. All rights reserved.
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[55%] px-6 py-8 sm:px-10 lg:px-14 xl:px-16">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
              <FaFish className="text-[#0284C7]" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                The Fishy Mart
              </h1>

              <p className="text-xs text-gray-500">
                Fresh from the sea. Delivered to you.
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-[#0284C7] text-sm font-semibold mb-2">
              WELCOME BACK
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Sign in to your account
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              Enter your details to continue your journey.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full h-13 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#0369A1] focus:ring-4 focus:ring-[#0369A1]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#0284C7] hover:text-[#0369A1] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-13 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#0369A1] focus:ring-4 focus:ring-[#0369A1]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0369A1] transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-[#7DD3FC] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0284C7]/20 hover:shadow-[#0369A1]/30 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />

            <span className="text-xs text-gray-400">OR</span>

            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Sign Up */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-[#0284C7] hover:text-[#0369A1] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
