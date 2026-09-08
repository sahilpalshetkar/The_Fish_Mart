import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaStore,
  FaMotorcycle,
  FaUtensils,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa6";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    role: "user",
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

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) {
      return {
        text: "",
        width: "0%",
      };
    }
    if (password.length < 6) {
      return {
        text: "Weak",
        width: "30%",
      };
    }
    if (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return {
        text: "Strong",
        width: "100%",
      };
    }
    return {
      text: "Medium",
      width: "65%",
    };
  };

  const passwordStrength = getPasswordStrength();

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    if (formData.fullName.trim().length < 3) {
      setError("Full name must contain at least 3 characters.");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!formData.mobile.trim()) {
      setError("Please enter your mobile number.");
      return false;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return false;
    }
    if (!formData.password) {
      setError("Please enter a password.");
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
        `${serverUrl}/api/auth/signup`,
        formData,
        {
          withCredentials: true,
        },
      );
      dispatch(setUserData(result.data));
      console.log(result.data);
      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);
      setError(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: "user",
      title: "Customer",
      description: "Order delicious food",
      icon: <FaUtensils />,
    },
    {
      value: "owner",
      title: "Shop Owner",
      description: "Manage your restaurant",
      icon: <FaStore />,
    },
    {
      value: "deliveryBoy",
      title: "Delivery Partner",
      description: "Deliver orders & earn",
      icon: <FaMotorcycle />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf5] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-[45%] relative bg-[#F0F9FF] overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-28 -left-28 w-80 h-80 bg-[#0284C7]/5 rounded-full" />
          <div className="absolute top-32 -right-32 w-96 h-96 bg-[#0284C7]/5 rounded-full" />
          <div className="absolute -bottom-40 -left-20 w-112.5 h-112.5 bg-[#0369A1]/5 rounded-full" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#0284C7]/5 rounded-t-[50%]" />
          <div className="relative z-10 flex flex-col justify-between p-12 w-full text-[#0369A1]">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                  <FaUtensils className="text-[#0284C7] text-xl" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    The Fishy Mart
                  </h1>
                  <p className="text-xs text-[#0284C7]/70">
                    Fresh fish. Fast delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="my-10">
              <p className="text-[#0284C7]/70 text-sm font-medium mb-4">
                WELCOME TO The Fishy Mart
              </p>

              <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
                From the dock,
                <br />
                to the doorstep.
              </h2>

              <p className="mt-6 text-[#0284C7]/80 text-base leading-relaxed max-w-md">
                Discover delicious meals from the fishy mart and get them
                delivered right to your doorstep.
              </p>

              {/* Benefits */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <FaCheck className="text-sm" />
                  </div>
                  <span className="text-sm">Fresh fish direct from docks</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <FaCheck className="text-sm" />
                  </div>
                  <span className="text-sm">Fast and reliable delivery</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <FaCheck className="text-sm" />
                  </div>
                  <span className="text-sm">Easy and secure ordering</span>
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
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
              <FaUtensils className="text-[#0284C7]" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                The Fishy Mart
              </h1>
              <p className="text-xs text-gray-500">
                Fresh fish. Fast delivery.
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <p className="text-[#0284C7] text-sm font-semibold mb-2">
              GET STARTED
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Create your account
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              Join us and discover your next favorite meal.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>

              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#0369A1] focus:ring-4 focus:ring-[#0369A1]/10"
                />
              </div>
            </div>

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
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#0369A1] focus:ring-4 focus:ring-[#0369A1]/10"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>

              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    if (value.length <= 10) {
                      setFormData((prev) => ({
                        ...prev,
                        mobile: value,
                      }));
                    }

                    setError("");
                  }}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#0369A1] focus:ring-4 focus:ring-[#0369A1]/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition-all focus:bg-white focus:border-[#0369A1] focus:ring-4 focus:ring-[#0369A1]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Password strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0284C7] rounded-full transition-all duration-300"
                      style={{
                        width: passwordStrength.width,
                      }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Password strength:{" "}
                    <span className="font-semibold">
                      {passwordStrength.text}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-[#F0F9FF] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0284C7]/20 hover:shadow-[#0369A1]/30 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          {/* Login */}
          <div className="mt-7 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-semibold text-[#0284C7] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
