import React, { useEffect, useState } from "react";
import {
  FaBoxOpen,
  FaClock,
  FaLocationDot,
  FaMoneyBillWave,
  FaPhone,
  FaTruck,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyOrders } from "../redux/orderSlice";

const OwnerOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  /*  FETCH OWNER ORDERS  */

  const fetchOwnerOrders = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${serverUrl}/api/order/owner-orders`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
        dispatch(setMyOrders(response.data.orders));
      }
    } catch (error) {
      console.error("Fetch owner orders error:", error);

      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerOrders();
  }, []);

  /*  FORMAT STATUS  */

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /*  FORMAT DATE  */

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*  STATUS COLORS  */

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

  /*  STATUS OPTIONS  */

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      pending: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
      ],

      confirmed: ["confirmed", "preparing", "ready", "out_for_delivery"],

      preparing: ["preparing", "ready", "out_for_delivery"],

      ready: ["ready", "out_for_delivery"],

      out_for_delivery: ["out_for_delivery"],
    };

    return statusFlow[currentStatus] || [];
  };

  /*  UPDATE STATUS  */

  const updateOrderStatus = async (orderId, status) => {
    if (!status) return;

    try {
      setUpdatingOrderId(orderId);

      const response = await axios.put(
        `${serverUrl}/api/order/update-status/${orderId}`,
        {
          status,
        },
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        toast.success("Order status updated");

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: status,
                }
              : order,
          ),
        );
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update order status error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /*  OWNER ITEMS  */

  const getOwnerItems = (order) => {
    if (order.ownerItems) {
      return order.ownerItems;
    }

    return order.items || [];
  };

  /*  LOADING  */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-8 w-48 animate-pulse rounded bg-gray-200" />

          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex justify-between">
                  <div className="space-y-3">
                    <div className="h-5 w-40 rounded bg-gray-200" />
                    <div className="h-4 w-60 rounded bg-gray-200" />
                  </div>

                  <div className="h-8 w-28 rounded-full bg-gray-200" />
                </div>

                <div className="mt-6 h-24 rounded-xl bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage orders from your shop
          </p>
        </div>

        {/* EMPTY */}

        {orders.length === 0 ? (
          <div className="flex min-h-100 items-center justify-center rounded-2xl border border-gray-100 bg-white">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <FaBoxOpen className="text-3xl text-gray-400" />
              </div>

              <h2 className="text-xl font-bold text-gray-800">No orders yet</h2>

              <p className="mt-2 text-sm text-gray-500">
                Orders containing your products will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const ownerItems = getOwnerItems(order);

              const statusOptions = getStatusOptions(order.orderStatus);

              const isUpdating = updatingOrderId === order._id;

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  {/* ORDER HEADER */}

                  <div className="border-b border-gray-100 p-5 md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-bold text-gray-900">
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

                        <p className="mt-2 text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="text-left lg:text-right">
                        <p className="text-xs text-gray-500">Order Total</p>

                        <p className="text-lg font-bold text-gray-900">
                          ₹{Number(order.totalAmount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BODY */}

                  <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-3">
                    {/* ITEMS */}

                    <div className="lg:col-span-2">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Order Items</h3>

                        <span className="text-xs text-gray-500">
                          {ownerItems.length}{" "}
                          {ownerItems.length === 1 ? "item" : "items"}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {ownerItems.map((item, index) => {
                          const image = item.image || item.item?.image;

                          return (
                            <div
                              key={item._id || index}
                              className="flex gap-4 rounded-xl bg-gray-50 p-3"
                            >
                              {/* IMAGE */}

                              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <FaBoxOpen className="text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* INFO */}

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {item.name}
                                    </h4>

                                    {item.category && (
                                      <p className="mt-1 text-xs text-gray-500">
                                        {item.category}
                                      </p>
                                    )}

                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {item.variant?.size && (
                                        <span className="rounded-md bg-white px-2 py-1 text-xs text-gray-600">
                                          Size: {item.variant.size}
                                        </span>
                                      )}

                                      {item.variant?.weight && (
                                        <span className="rounded-md bg-white px-2 py-1 text-xs text-gray-600">
                                          Weight: {item.variant.weight}
                                          {item.variant.weightUnit}
                                        </span>
                                      )}

                                      {item.variant?.cleaningInstruction && (
                                        <span className="rounded-md bg-white px-2 py-1 text-xs text-gray-600">
                                          {item.variant.cleaningInstruction}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="sm:text-right">
                                    <p className="font-bold text-gray-900">
                                      ₹{Number(item.price || 0).toFixed(2)}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CUSTOMER */}

                    <div>
                      <h3 className="mb-4 font-bold text-gray-900">Customer</h3>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="font-semibold text-gray-900">
                          {order.deliveryAddress?.fullName ||
                            order.user?.fullName ||
                            "Customer"}
                        </p>

                        {order.deliveryAddress?.mobile && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                            <FaPhone className="text-xs" />

                            {order.deliveryAddress.mobile}
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          <FaLocationDot className="mt-1 shrink-0 text-gray-500" />

                          <div className="text-sm text-gray-600">
                            <p>{order.deliveryAddress?.address}</p>

                            {order.deliveryAddress?.landmark && (
                              <p>Near {order.deliveryAddress.landmark}</p>
                            )}

                            <p>
                              {order.deliveryAddress?.city},{" "}
                              {order.deliveryAddress?.state}
                            </p>

                            <p>{order.deliveryAddress?.pincode}</p>
                          </div>
                        </div>
                      </div>

                      {/* PAYMENT */}

                      <div className="mt-4 rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center gap-2">
                          <FaMoneyBillWave className="text-gray-500" />

                          <h4 className="font-semibold text-gray-900">
                            Payment
                          </h4>
                        </div>

                        <div className="mt-3 flex justify-between text-sm">
                          <span className="text-gray-500">Method</span>

                          <span className="font-semibold">
                            {order.paymentMethod === "ONLINE"
                              ? "Online"
                              : "COD"}
                          </span>
                        </div>

                        <div className="mt-2 flex justify-between text-sm">
                          <span className="text-gray-500">Status</span>

                          <span
                            className={
                              order.paymentStatus === "paid"
                                ? "font-semibold text-green-600"
                                : "font-semibold text-orange-600"
                            }
                          >
                            {formatStatus(order.paymentStatus || "pending")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}

                  <div className="border-t border-gray-100 bg-gray-50 p-5 md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* CURRENT STATUS */}

                      <div className="flex items-center gap-3">
                        <FaClock className="text-gray-500" />

                        <div>
                          <p className="text-xs text-gray-500">
                            Current Status
                          </p>

                          <p className="font-semibold text-gray-900">
                            {formatStatus(order.orderStatus)}
                          </p>
                        </div>
                      </div>

                      {/* STATUS DROPDOWN */}

                      {order.orderStatus !== "cancelled" &&
                        order.orderStatus !== "delivered" && (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label className="text-sm font-medium text-gray-600">
                              Update Status
                            </label>

                            <select
                              value={order.orderStatus}
                              disabled={isUpdating}
                              onChange={(e) =>
                                updateOrderStatus(order._id, e.target.value)
                              }
                              className="min-w-47.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {formatStatus(status)}
                                </option>
                              ))}
                            </select>

                            {isUpdating && (
                              <span className="text-xs text-gray-500">
                                Updating...
                              </span>
                            )}
                          </div>
                        )}

                      {/* OUT FOR DELIVERY */}

                      {order.orderStatus === "out_for_delivery" && (
                        <div className="flex items-center gap-2 rounded-xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-cyan-700">
                          <FaTruck />
                          Waiting for delivery
                        </div>
                      )}

                      {/* DELIVERED */}

                      {order.orderStatus === "delivered" && (
                        <div className="flex items-center gap-2 rounded-xl bg-green-100 px-5 py-3 text-sm font-semibold text-green-700">
                          Order Delivered
                        </div>
                      )}

                      {/* CANCELLED */}

                      {order.orderStatus === "cancelled" && (
                        <div className="rounded-xl bg-red-100 px-5 py-3 text-sm font-semibold text-red-700">
                          Order Cancelled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerOrders;
