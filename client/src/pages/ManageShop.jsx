import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  FaStore,
  FaPen,
  FaCircleCheck,
  FaCircleXmark,
  FaUtensils,
  FaPlus,
  FaList,
  FaMotorcycle,
  FaTrash,
  FaLocationDot,
  FaPhone,
  FaStar,
  FaClock,
  FaArrowRight,
} from "react-icons/fa6";
import { setMyShopData } from "../redux/adminSlice";
import { serverUrl } from "../App";

const ManageShop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.admin);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(myShopData?.isOpen ?? true);

  if (!myShopData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <FaStore size={28} />
          </div>

          <h2 className="text-xl font-bold text-slate-800">No Shop Found</h2>

          <p className="text-sm text-slate-500 mt-2">
            You haven't created a shop yet.
          </p>

          <button
            onClick={() => navigate("/create-shop")}
            className="mt-6 bg-[#0369A1] hover:bg-[#075985] text-white px-5 py-3 rounded-xl font-semibold text-sm transition"
          >
            Create Shop
          </button>
        </div>
      </div>
    );
  }

  const items = myShopData.items || [];
  const totalItems = items.length;
  const availableItems = items.filter(
    (item) => item.isAvailable !== false,
  ).length;
  const unavailableItems = totalItems - availableItems;
  const handleToggleShop = async () => {
    try {
      const newStatus = !isShopOpen;
      setIsShopOpen(newStatus);

      await axios.put(
        `${serverUrl}/api/shop/update-status`,
        {
          isOpen: newStatus,
        },
        {
          withCredentials: true,
        },
      );

      dispatch(
        setMyShopData({
          ...myShopData,
          isOpen: newStatus,
        }),
      );
    } catch (error) {
      console.log("toggle shop error:", error);
      setIsShopOpen((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Manage Shop
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage your shop, menu and delivery settings
              </p>
            </div>

            {/* Shop status badge */}
            <div
              className={`flex items-center gap-2 w-fit px-4 py-2 rounded-full text-sm font-semibold ${
                isShopOpen
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isShopOpen ? (
                <FaCircleCheck size={14} />
              ) : (
                <FaCircleXmark size={14} />
              )}

              {isShopOpen ? "Shop is Open" : "Shop is Closed"}
            </div>
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Shop Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FaStore size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">Shop Details</h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Basic information about your shop
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/create-edit-shop")}
                className="flex items-center gap-2 text-sm font-semibold text-[#0369A1] hover:text-[#075985] transition"
              >
                <FaPen size={12} />
                Edit
              </button>
            </div>

            <div className="mt-6">
              {/* Shop image */}
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={myShopData.image}
                  alt={myShopData.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
                />

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {myShopData.name}
                  </h3>

                  {myShopData.description && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {myShopData.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {myShopData.address && (
                  <div className="flex items-start gap-3">
                    <FaLocationDot className="text-slate-400 mt-1" />

                    <p className="text-sm text-slate-600">
                      {myShopData.address}
                    </p>
                  </div>
                )}

                {myShopData.mobile && (
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-slate-400" />

                    <p className="text-sm text-slate-600">
                      {myShopData.mobile}
                    </p>
                  </div>
                )}

                {myShopData.rating !== undefined && (
                  <div className="flex items-center gap-3">
                    <FaStar className="text-amber-400" />

                    <p className="text-sm text-slate-600">
                      {myShopData.rating} Rating
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shop Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isShopOpen
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {isShopOpen ? (
                  <FaCircleCheck size={20} />
                ) : (
                  <FaCircleXmark size={20} />
                )}
              </div>

              <div>
                <h2 className="font-bold text-slate-800">Shop Status</h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Control whether customers can order
                </p>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-5">
              <div>
                <h3 className="font-semibold text-slate-800">
                  {isShopOpen ? "Shop is Open" : "Shop is Closed"}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {isShopOpen
                    ? "Customers can currently place orders."
                    : "Customers cannot place new orders."}
                </p>
              </div>

              {/* Toggle */}
              <button
                onClick={handleToggleShop}
                className={`relative w-14 h-7 rounded-full transition ${
                  isShopOpen ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition ${
                    isShopOpen ? "left-8" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FaClock />
                <span>Shop status can be changed anytime.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <FaUtensils size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">Menu</h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your shop items
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate("/add-item")}
                className="flex items-center justify-center gap-2 bg-[#0369A1] hover:bg-[#075985] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <FaPlus size={12} />
                Add Item
              </button>

              <button
                onClick={() => navigate("/manage-items")}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <FaList size={12} />
                Manage Items
              </button>
            </div>
          </div>

          {/* Menu Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">Total Items</p>

              <p className="text-2xl font-bold text-slate-800 mt-1">
                {totalItems}
              </p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs text-emerald-600">Available</p>

              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {availableItems}
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-xs text-red-500">Unavailable</p>

              <p className="text-2xl font-bold text-red-600 mt-1">
                {unavailableItems}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FaMotorcycle size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">Delivery Settings</h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Configure your delivery preferences
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/delivery-settings")}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-[#0369A1] hover:text-[#075985] transition"
            >
              Edit Settings
              <FaArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">Delivery</p>

              <p className="font-semibold text-slate-800 mt-1">
                {myShopData.deliveryAvailable !== false
                  ? "Available"
                  : "Unavailable"}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">Delivery Radius</p>

              <p className="font-semibold text-slate-800 mt-1">
                {myShopData.deliveryRadius
                  ? `${myShopData.deliveryRadius} km`
                  : "Not set"}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">Delivery Fee</p>

              <p className="font-semibold text-slate-800 mt-1">
                {myShopData.deliveryFee !== undefined
                  ? `₹${myShopData.deliveryFee}`
                  : "Not set"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageShop;
