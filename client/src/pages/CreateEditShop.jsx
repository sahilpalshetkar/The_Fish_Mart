import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaFish,
  FaArrowLeft,
  FaCamera,
  FaLocationDot,
  FaStore,
  FaMapLocationDot,
  FaCloudArrowUp,
  FaCheck,
} from "react-icons/fa6";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/adminSlice";
import { ClipLoader } from "react-spinners";

const CreateEditShop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.admin);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user,
  );

  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(
    myShopData?.address || currentAddress || "",
  );
  const [city, setCity] = useState(myShopData?.city || currentCity || "");
  const [state, setState] = useState(myShopData?.state || currentState || "");
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // image
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate image size
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      return;
    }
    setError("");
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your restaurant name.");
      return;
    }
    if (!city.trim()) {
      setError("Please enter your city.");
      return;
    }
    if (!state.trim()) {
      setError("Please enter your state.");
      return;
    }
    if (!address.trim()) {
      setError("Please enter your restaurant address.");
      return;
    }
    if (!myShopData && !backendImage) {
      setError("Please upload a restaurant image.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("city", city.trim());
      formData.append("state", state.trim());
      formData.append("address", address.trim());

      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        {
          withCredentials: true,
        },
      );
      dispatch(setMyShopData(result.data));
      console.log(result.data);
      navigate("/");
    } catch (error) {
      console.error("Create/Edit Shop Error:", error);
      setError(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FCFF]">
      {/* Top nav */}
      <header className="h-18 sm:h-20 bg-white border-b border-[#E0F2FE] flex items-center px-4 sm:px-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#0284C7] transition"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
            <FaArrowLeft className="text-[#0284C7] text-sm" />
          </div>

          <span className="hidden sm:block text-sm font-medium">Back</span>
        </button>

        <div className="mx-auto flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
            <FaFish className="text-[#0284C7]" />
          </div>

          <span className="font-bold text-gray-900">Fish Company</span>
        </div>

        <div className="w-16 sm:w-20" />
      </header>

      {/* Page */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-[#F0F9FF] text-[#0284C7] px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
            <FaStore />

            {myShopData ? "RESTAURANT SETTINGS" : "RESTAURANT ONBOARDING"}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            {myShopData ? "Update your shop" : "Bring your shop online"}
          </h1>

          <p className="text-gray-500 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
            {myShopData
              ? "Keep your restaurant information fresh and up to date."
              : "Set up your restaurant profile and start serving fresh seafood to customers."}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-[#E0F2FE] shadow-[0_15px_50px_rgba(2,132,199,0.07)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Left Section */}
            <div className="lg:col-span-2 bg-[#0369A1] p-6 sm:p-8 lg:p-10 relative overflow-hidden">
              {/* Decorative bubbles */}

              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />

              <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-white/5" />

              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-7">
                  <p className="text-[#BAE6FD] text-xs font-semibold uppercase tracking-wider">
                    Your Restaurant
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                    Make a great first impression.
                  </h2>

                  <p className="text-[#BAE6FD] text-sm mt-3 leading-relaxed">
                    Add a beautiful photo of your restaurant to help customers
                    discover your business.
                  </p>
                </div>

                {/* IMAGE UPLOAD */}
                <label className="relative block cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />

                  <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden border-2 border-dashed border-white/30 group-hover:border-white/60 transition-all">
                    {frontendImage ? (
                      <>
                        <img
                          src={frontendImage}
                          alt="Restaurant preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />

                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#F0F9FF] flex items-center justify-center">
                              <FaCamera className="text-[#0284C7]" />
                            </div>

                            <div>
                              <p className="text-xs font-bold text-gray-800">
                                Change image
                              </p>

                              <p className="text-[10px] text-gray-400">
                                Click to upload another
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
                          <FaCloudArrowUp className="text-white text-2xl" />
                        </div>

                        <p className="text-white font-semibold">
                          Upload restaurant image
                        </p>

                        <p className="text-[#BAE6FD] text-xs mt-1">
                          PNG, JPG or WEBP · Max 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </label>

                {/* Tips */}
                <div className="mt-auto pt-8 hidden lg:block">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <FaCheck className="text-[#BAE6FD] text-[9px]" />
                      </div>

                      <span className="text-xs text-[#BAE6FD]">
                        Use a clear, high-quality image
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <FaCheck className="text-[#BAE6FD] text-[9px]" />
                      </div>

                      <span className="text-xs text-[#BAE6FD]">
                        Show your restaurant or seafood
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <FaCheck className="text-[#BAE6FD] text-[9px]" />
                      </div>

                      <span className="text-xs text-[#BAE6FD]">
                        Avoid blurry or dark photos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                {/* Restaurant Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Restaurant Name
                  </label>

                  <div className="relative">
                    <FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                    <input
                      type="text"
                      placeholder="e.g. Mumbai Fresh Fish"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition focus:bg-white focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10"
                    />
                  </div>
                </div>

                {/* Location Heading */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#F0F9FF] flex items-center justify-center">
                      <FaLocationDot className="text-[#0284C7] text-sm" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Restaurant Location
                      </h3>

                      <p className="text-[11px] text-gray-400">
                        Where customers can find you
                      </p>
                    </div>
                  </div>
                </div>

                {/* City + State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>

                    <div className="relative">
                      <FaMapLocationDot className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                      <input
                        type="text"
                        placeholder="Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition focus:bg-white focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>

                    <input
                      type="text"
                      placeholder="Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none transition focus:bg-white focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Address
                  </label>

                  <div className="relative">
                    <FaLocationDot className="absolute left-4 top-4 text-gray-400 text-sm" />

                    <textarea
                      rows={4}
                      placeholder="Enter your complete restaurant address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm outline-none resize-none transition focus:bg-white focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-13 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-[#BAE6FD] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0284C7]/20 hover:shadow-[#0369A1]/25 active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <ClipLoader size={19} color="white" />

                        {myShopData
                          ? "Updating Restaurant..."
                          : "Creating Restaurant..."}
                      </>
                    ) : (
                      <>
                        {myShopData ? "Save Changes" : "Create Restaurant"}

                        <FaArrowLeft className="rotate-180 text-xs" />
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom note */}
                <p className="text-center text-[11px] text-gray-400">
                  You can update your restaurant information anytime from your
                  owner dashboard.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateEditShop;
