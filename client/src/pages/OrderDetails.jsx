import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaCheck,
  FaChevronRight,
  FaCircleCheck,
  FaClock,
  FaLocationDot,
  FaMoneyBillWave,
  FaTruck,
  FaXmark,
} from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { serverUrl } from "../App";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${serverUrl}/api/order/get/${orderId}`,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error("Fetch order error:", error);

      toast.error(error.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

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

  const formatDateTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getItemImage = (item) => {
    if (item?.image) return item.image;
    if (item?.item?.image) return item.item.image;

    return "";
  };

  const getStatusIndex = (status) => {
    const statuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "shipped",
      "out_for_delivery",
      "delivered",
    ];

    return statuses.indexOf(status);
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    try {
      setCancelling(true);

      const response = await axios.put(
        `${serverUrl}/api/order/cancel/${order._id}`,
        {},
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully");

        setOrder((prev) => ({
          ...prev,
          orderStatus: "cancelled",
        }));
      }
    } catch (error) {
      console.error("Cancel order error:", error);

      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="mb-6 h-5 w-32 rounded bg-gray-200" />

          <div className="rounded-2xl bg-white p-6">
            <div className="h-7 w-56 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-40 rounded bg-gray-200" />

            <div className="mt-8 h-24 rounded-xl bg-gray-200" />

            <div className="mt-6 space-y-4">
              <div className="h-24 rounded-xl bg-gray-200" />
              <div className="h-24 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <FaBoxOpen className="mx-auto mb-4 text-5xl text-gray-300" />

          <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>

          <p className="mt-2 text-gray-500">We couldn't find this order.</p>

          <button
            onClick={() => navigate("/orders")}
            className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.orderStatus);

  const canCancel = ["pending", "confirmed"].includes(order.orderStatus);

  const isFinished =
    order.orderStatus === "delivered" || order.orderStatus === "cancelled";

  const statusSteps = [
    {
      status: "pending",
      title: "Order Placed",
      description: "Your order has been received",
    },
    {
      status: "confirmed",
      title: "Order Confirmed",
      description: "Your order has been confirmed",
    },
    {
      status: "preparing",
      title: "Preparing",
      description: "Your fish is being prepared",
    },
    {
      status: "ready",
      title: "Ready",
      description: "Your order is ready for dispatch",
    },
    {
      status: "shipped",
      title: "Shipped",
      description: "Your order has left the shop",
    },
    {
      status: "out_for_delivery",
      title: "Out for Delivery",
      description: "Your order is on the way",
    },
    {
      status: "delivered",
      title: "Delivered",
      description: "Order delivered successfully",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-black"
        >
          <FaArrowLeft />
          Back to My Orders
        </button>

        {/* Header */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>

              <h1 className="mt-1 text-xl font-bold text-gray-900 md:text-2xl">
                #{order._id?.slice(-10).toUpperCase()}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Placed on {formatDateTime(order.createdAt)}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                  order.orderStatus === "delivered"
                    ? "bg-green-100 text-green-700"
                    : order.orderStatus === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {formatStatus(order.orderStatus)}
              </span>

              {!isFinished && (
                <button
                  onClick={() => navigate(`/track-order/${order._id}`)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 sm:w-auto"
                >
                  <FaTruck />
                  Track Order
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-5 lg:col-span-2">
            {/* Items */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Order Items</h2>

                <span className="text-sm text-gray-500">
                  {order.items?.length || 0}{" "}
                  {order.items?.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items?.map((item, index) => (
                  <div
                    key={item._id || index}
                    className={`flex gap-4 py-5 first:pt-0 last:pb-0 ${
                      index === 0 ? "" : ""
                    }`}
                  >
                    {/* Image */}
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {getItemImage(item) ? (
                        <img
                          src={getItemImage(item)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FaBoxOpen className="text-2xl text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {item.name}
                          </h3>

                          {item.category && (
                            <p className="mt-1 text-xs text-gray-500">
                              {item.category}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.variant?.size && (
                              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                Size: {item.variant.size}
                              </span>
                            )}

                            {item.variant?.weight && (
                              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                Weight: {item.variant.weight}
                                {item.variant.weightUnit}
                              </span>
                            )}

                            {item.variant?.cleaningInstruction && (
                              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                {item.variant.cleaningInstruction}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <p className="font-bold text-gray-900">
                            ₹{Number(item.price || 0).toFixed(2)}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            ₹
                            {(
                              Number(item.price || 0) *
                              Number(item.quantity || 1)
                            ).toFixed(2)}{" "}
                            total
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <FaLocationDot className="text-gray-600" />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">Delivery Address</h2>

                  <p className="text-xs text-gray-500">
                    Where your order will be delivered
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                {order.deliveryAddress?.fullName && (
                  <p className="font-semibold text-gray-900">
                    {order.deliveryAddress.fullName}
                  </p>
                )}

                {order.deliveryAddress?.mobile && (
                  <p className="mt-1 text-sm text-gray-600">
                    {order.deliveryAddress.mobile}
                  </p>
                )}

                {order.deliveryAddress?.address && (
                  <p className="mt-3 text-sm text-gray-600">
                    {order.deliveryAddress.address}
                  </p>
                )}

                {order.deliveryAddress?.landmark && (
                  <p className="text-sm text-gray-500">
                    Near {order.deliveryAddress.landmark}
                  </p>
                )}

                <p className="mt-1 text-sm text-gray-600">
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state}{" "}
                  - {order.deliveryAddress?.pincode}
                </p>
              </div>
            </div>

            {/* Order Timeline */}
            {!isFinished && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
                <h2 className="mb-6 text-lg font-bold text-gray-900">
                  Order Status
                </h2>

                <div className="relative">
                  {statusSteps.map((step, index) => {
                    const completed = index <= currentStatusIndex;

                    const current = index === currentStatusIndex;

                    return (
                      <div
                        key={step.status}
                        className="relative flex gap-4 pb-7 last:pb-0"
                      >
                        {/* Line */}
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`absolute left-3.75 top-8 h-full w-0.5 ${
                              index < currentStatusIndex
                                ? "bg-black"
                                : "bg-gray-200"
                            }`}
                          />
                        )}

                        {/* Circle */}
                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                            completed
                              ? "border-black bg-black text-white"
                              : "border-gray-200 bg-white text-gray-300"
                          } ${current ? "ring-4 ring-gray-100" : ""}`}
                        >
                          {completed ? (
                            <FaCheck className="text-xs" />
                          ) : (
                            <FaCircleCheck className="text-xs" />
                          )}
                        </div>

                        {/* Text */}
                        <div className="pt-0.5">
                          <p
                            className={`font-semibold ${
                              current
                                ? "text-black"
                                : completed
                                  ? "text-gray-800"
                                  : "text-gray-400"
                            }`}
                          >
                            {step.title}
                          </p>

                          <p
                            className={`mt-1 text-sm ${
                              completed ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {step.description}
                          </p>

                          {current && (
                            <p className="mt-1 text-xs font-medium text-gray-400">
                              Current status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled */}
            {order.orderStatus === "cancelled" && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <FaXmark className="text-red-600" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-red-800">
                      Order Cancelled
                    </h3>

                    <p className="mt-1 text-sm text-red-600">
                      This order has been cancelled.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Order Summary */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>

                  <span className="font-medium text-gray-800">
                    ₹{Number(order.subtotal || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Fee</span>

                  <span className="font-medium text-gray-800">
                    ₹{Number(order.deliveryFee || 0).toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>

                    <span className="text-xl font-bold text-gray-900">
                      ₹{Number(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <FaMoneyBillWave className="text-gray-600" />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900">Payment</h2>

                  <p className="text-xs text-gray-500">Payment information</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Method</span>

                  <span className="font-semibold text-gray-800">
                    {order.paymentMethod === "ONLINE"
                      ? "Online Payment"
                      : "Cash on Delivery"}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Status</span>

                  <span
                    className={
                      order.paymentStatus === "paid"
                        ? "font-semibold text-green-600"
                        : order.paymentStatus === "failed"
                          ? "font-semibold text-red-600"
                          : "font-semibold text-orange-600"
                    }
                  >
                    {formatStatus(order.paymentStatus || "pending")}
                  </span>
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.estimatedDelivery && (
              <div className="rounded-2xl bg-black p-5 text-white shadow-sm">
                <div className="flex items-center gap-3">
                  <FaClock className="text-lg" />

                  <div>
                    <p className="text-xs text-gray-400">Estimated Delivery</p>

                    <p className="mt-1 font-semibold">
                      {order.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cancel */}
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaXmark />

                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}

            {/* Continue Shopping */}
            {order.orderStatus === "delivered" && (
              <button
                onClick={() => navigate("/products")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Continue Shopping
                <FaChevronRight className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
