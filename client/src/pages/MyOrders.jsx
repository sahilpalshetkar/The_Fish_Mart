import React, { useEffect, useState } from "react";
import {
  FaBoxOpen,
  FaChevronRight,
  FaLocationDot,
  FaTruck,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { serverUrl } from "../App";

const MyOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${serverUrl}/api/order/my-orders`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
        console.log(response.data.orders || []);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);

      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "preparing":
        return "bg-orange-100 text-orange-700";

      case "ready":
        return "bg-purple-100 text-purple-700";

      case "shipped":
        return "bg-indigo-100 text-indigo-700";

      case "out_for_delivery":
        return "bg-cyan-100 text-cyan-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getItemImage = (item) => {
    if (item?.image) return item.image;

    if (item?.item?.image) return item.item.image;

    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-48 rounded bg-gray-200" />
                  </div>

                  <div className="h-7 w-24 rounded-full bg-gray-200" />
                </div>

                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded-xl bg-gray-200" />
                  <div className="space-y-3">
                    <div className="h-4 w-48 rounded bg-gray-200" />
                    <div className="h-3 w-32 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <FaBoxOpen className="text-3xl text-gray-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">No orders yet</h2>

          <p className="mt-2 text-gray-500">
            Your orders will appear here once you place one.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            My Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track and manage your recent orders
          </p>
        </div>

        {/* Orders */}
        <div className="space-y-5">
          {orders.map((order) => {
            const firstItem = order.items?.[0];

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                {/* Order Header */}
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold text-gray-900">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          order.orderStatus,
                        )}`}
                      >
                        {formatStatus(order.orderStatus)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500">Total Amount</p>

                    <p className="text-lg font-bold text-gray-900">
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={item._id || index} className="flex gap-4">
                        {/* Image */}
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          {getItemImage(item) ? (
                            <img
                              src={getItemImage(item)}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FaBoxOpen className="text-xl text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col justify-between gap-2 sm:flex-row">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {item.name}
                              </h3>

                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                {item.variant?.size && (
                                  <span>Size: {item.variant.size}</span>
                                )}

                                {item.variant?.weight && (
                                  <span>
                                    • {item.variant.weight}
                                    {item.variant.weightUnit}
                                  </span>
                                )}

                                {item.variant?.cleaningInstruction && (
                                  <span>
                                    • {item.variant.cleaningInstruction}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="font-semibold text-gray-900">
                                ₹{Number(item.price || 0).toFixed(2)}
                              </p>

                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  {order.deliveryAddress && (
                    <div className="mt-5 flex gap-3 rounded-xl bg-gray-50 p-4">
                      <FaLocationDot className="mt-1 shrink-0 text-gray-500" />

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Delivery Address
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {order.deliveryAddress.address}
                        </p>

                        <p className="text-sm text-gray-500">
                          {order.deliveryAddress.city},{" "}
                          {order.deliveryAddress.state} -{" "}
                          {order.deliveryAddress.pincode}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bottom */}
                  <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500">Payment: </span>

                      <span className="font-semibold text-gray-800">
                        {order.paymentMethod === "ONLINE"
                          ? "Online"
                          : "Cash on Delivery"}
                      </span>

                      <span className="mx-2 text-gray-300">|</span>

                      <span
                        className={
                          order.orderStatus !== "delivered"
                            ? "font-semibold text-green-600"
                            : order.paymentStatus === "paid"
                              ? "font-semibold text-green-600"
                              : "font-semibold text-orange-600"
                        }
                      >
                        {order.orderStatus == "delivered"
                          ? "Paid"
                          : formatStatus(order.paymentStatus || "pending")}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      {/* Track */}
                      {order.orderStatus !== "cancelled" &&
                        order.orderStatus !== "delivered" && (
                          <button
                            onClick={() =>
                              navigate(`/track-order/${order._id}`)
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            <FaTruck />
                            Track Order
                            <FaChevronRight className="text-xs" />
                          </button>
                        )}

                      {/* Details */}
                      <button
                        onClick={() => navigate(`/order/${order._id}`)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                      >
                        View Details
                        <FaChevronRight className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
