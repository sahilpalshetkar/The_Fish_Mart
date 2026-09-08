import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaBoxOpen,
  FaArrowRight,
  FaPen,
} from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData, currentAddress } = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your account and personal information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Top section */}
          <div className="bg-linear-to-r from-[#0369A1] to-[#0284C7] px-6 py-8 md:px-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
                <FaUser className="text-3xl text-[#0369A1]" />
              </div>

              {/* User */}
              <div className="text-center sm:text-left text-white">
                <h2 className="text-xl md:text-2xl font-bold">
                  {userData?.fullName || "User"}
                </h2>

                <p className="text-sm text-sky-100 mt-1">
                  {userData?.email || "No email available"}
                </p>

                {userData?.role && (
                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold capitalize">
                    {userData.role}
                  </span>
                )}
              </div>

              {/* Edit */}
              <button
                onClick={() => navigate("/edit-profile")}
                className="sm:ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0369A1] text-sm font-semibold hover:bg-sky-50 transition"
              >
                <FaPen className="text-xs" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Information */}
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-5">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center">
                  <FaUser className="text-[#0369A1]" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Full Name</p>

                  <p className="font-semibold text-slate-700">
                    {userData?.fullName || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center">
                  <FaEnvelope className="text-[#0369A1]" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Email</p>

                  <p className="font-semibold text-slate-700 truncate">
                    {userData?.email || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center">
                  <FaPhone className="text-[#0369A1]" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Mobile Number</p>

                  <p className="font-semibold text-slate-700">
                    {userData?.mobile || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center">
                  <FaLocationDot className="text-[#0369A1]" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Address</p>

                  <p className="font-semibold text-slate-700">
                    {currentAddress || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {/* Orders */}
          <button
            onClick={() => navigate("/my-orders")}
            className="group bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex items-center gap-4 text-left hover:border-sky-200 hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
              <FaBoxOpen className="text-xl text-[#0369A1]" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-slate-800">My Orders</h3>

              <p className="text-sm text-slate-500 mt-1">
                View and track your orders
              </p>
            </div>

            <FaArrowRight className="text-slate-400 group-hover:text-[#0369A1] group-hover:translate-x-1 transition" />
          </button>

          {/* Edit Profile */}
          <button
            onClick={() => navigate("/edit-profile")}
            className="group bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex items-center gap-4 text-left hover:border-sky-200 hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
              <FaPen className="text-lg text-[#0369A1]" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-slate-800">Edit Profile</h3>

              <p className="text-sm text-slate-500 mt-1">
                Update your personal information
              </p>
            </div>

            <FaArrowRight className="text-slate-400 group-hover:text-[#0369A1] group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-100 bg-white text-red-500 font-semibold hover:bg-red-50 transition"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
