import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaPen,
  FaFish,
  FaWeightHanging,
  FaToggleOn,
  FaToggleOff,
  FaCircleExclamation,
} from "react-icons/fa6";
import { setMyShopData } from "../redux/adminSlice";
import { serverUrl } from "../App";

const ManageItems = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.admin);

  const [items, setItems] = useState(myShopData?.items || []);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    setItems(myShopData?.items || []);
  }, [myShopData]);

  //handle availability
  const handleAvailability = async (itemId, currentStatus) => {
    try {
      setUpdatingId(itemId);

      const result = await axios.patch(
        `${serverUrl}/api/item/update-availability/${itemId}`,
        {
          isAvailable: !currentStatus,
        },
        { withCredentials: true },
      );

      const updatedItems = items.map((item) =>
        item._id === itemId
          ? { ...item, isAvailable: result.data.item.isAvailable }
          : item,
      );

      setItems(updatedItems);

      dispatch(
        setMyShopData({
          ...myShopData,
          items: updatedItems,
        }),
      );
    } catch (error) {
      console.log("availability update error:", error);
      alert(error?.response?.data?.message || "Failed to update availability.");
    } finally {
      setUpdatingId(null);
    }
  };

  //handle delete
  const handleDelete = async (itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?",
    );
    if (!confirmed) return;
    try {
      setDeletingId(itemId);
      const result = await axios.get(`${serverUrl}/api/item/delete/${itemId}`, {
        withCredentials: true,
      });
      console.log("Item deleted:", result.data);

      const updatedItems = items.filter((item) => item._id !== itemId);
      setItems(updatedItems);
      dispatch(
        setMyShopData({
          ...myShopData,
          items: updatedItems,
        }),
      );
    } catch (error) {
      console.log("delete item error:", error);
      alert(error?.response?.data?.message || "Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  };

  // -----------------------------
  // No Shop
  // -----------------------------

  if (!myShopData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <FaFish size={28} />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mt-5">
            No Shop Found
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Create a shop before managing your items.
          </p>

          <button
            onClick={() => navigate("/create-shop")}
            className="mt-5 bg-[#0369A1] hover:bg-[#075985] text-white px-5 py-3 rounded-xl text-sm font-semibold"
          >
            Create Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
            >
              <FaArrowLeft size={15} />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Manage Items
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage the fish available in your shop
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/add-item")}
            className="flex items-center justify-center gap-2 bg-[#0369A1] hover:bg-[#075985] text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
          >
            <FaPlus size={12} />
            Add Fish
          </button>
        </div>

        {/* -------------------------------- */}
        {/* Stats */}
        {/* -------------------------------- */}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500">Total Items</p>

            <p className="text-2xl font-bold text-slate-800 mt-1">
              {items.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500">Categories</p>

            <p className="text-2xl font-bold text-slate-800 mt-1">
              {new Set(items.map((item) => item.category)).size}
            </p>
          </div>

          <div className="hidden sm:block bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-slate-500">Shop</p>

            <p className="text-lg font-bold text-slate-800 mt-1 truncate">
              {myShopData.name}
            </p>
          </div>
        </div>

        {/* -------------------------------- */}
        {/* Empty State */}
        {/* -------------------------------- */}

        {items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FaFish size={28} />
            </div>

            <h2 className="text-lg font-bold text-slate-800 mt-5">
              No Items Yet
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Start adding fish to your shop menu.
            </p>

            <button
              onClick={() => navigate("/add-item")}
              className="mt-5 inline-flex items-center gap-2 bg-[#0369A1] hover:bg-[#075985] text-white px-5 py-3 rounded-xl text-sm font-semibold transition"
            >
              <FaPlus size={12} />
              Add Your First Fish
            </button>
          </div>
        ) : (
          /* -------------------------------- */
          /* Items Grid */
          /* -------------------------------- */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Image */}
                <div className="relative h-52 bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Category */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                    {item.category}
                  </span>

                  {/* Availability Toggle */}
                  <button
                    onClick={() =>
                      handleAvailability(item._id, item.isAvailable)
                    }
                    disabled={updatingId === item._id}
                    className={`absolute top-3 right-14 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      item.isAvailable
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-red-50 text-red-500 hover:bg-red-100"
                    } disabled:opacity-50`}
                  >
                    {updatingId === item._id ? (
                      <span>Updating...</span>
                    ) : (
                      <>
                        {item.isAvailable ? (
                          <FaToggleOn className="text-lg" />
                        ) : (
                          <FaToggleOff className="text-lg" />
                        )}

                        {item.isAvailable ? "Available" : "Unavailable"}
                      </>
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white text-red-500 shadow-md flex items-center justify-center hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {deletingId === item._id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <FaTrash size={13} />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-lg text-slate-800">
                        {item.name}
                      </h2>

                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-4">
                    <span className="text-xl font-bold text-[#0369A1]">
                      ₹{item.variants[0].price}
                    </span>

                    <span className="text-xs text-slate-400 ml-1">
                      starting price
                    </span>
                  </div>

                  {/* Weights */}
                  {item.weights?.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                        <FaWeightHanging size={11} className="text-slate-400" />
                        Available Weights
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.weights.map((weight, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600"
                          >
                            {weight}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cleaning */}
                  {item.cleaningInstructions?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        Cleaning Options
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {item.cleaningInstructions
                          .slice(0, 2)
                          .map((instruction, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium"
                            >
                              {instruction}
                            </span>
                          ))}

                        {item.cleaningInstructions.length > 2 && (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium">
                            +{item.cleaningInstructions.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => navigate(`/edit-item/${item._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-semibold transition"
                    >
                      <FaPen size={11} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
                    >
                      <FaTrash size={11} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageItems;
