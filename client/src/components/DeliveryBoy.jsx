import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClipLoader } from "react-spinners";

const DeliveryBoy = () => {
  const { userData } = useSelector((state) => state.user);

  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);

  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);

  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");

  const [todayDeliveries, setTodayDeliveries] = useState([]);

  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /*  DELIVERY BOY LOCATION */

  useEffect(() => {
    if (!userData?._id) return;

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setDeliveryBoyLocation({
            lat: latitude,
            lon: longitude,
          });
        },
        (error) => {
          console.log("Location error:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 10000,
        },
      );
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [userData?._id]);

  /*  GET AVAILABLE ASSIGNMENTS */

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });

      const assignments = result.data?.assignments || result.data || [];

      setAvailableAssignments(assignments);
    } catch (error) {
      console.log(
        "Get assignments error:",
        error?.response?.data || error.message,
      );
    }
  };

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        {
          withCredentials: true,
        },
      );

      const order = result.data?.order || result.data;

      setCurrentOrder(order || null);
    } catch (error) {
      /*
       * 404 can simply mean there is no current order.
       */
      if (error?.response?.status === 404) {
        setCurrentOrder(null);
      } else {
        console.log(
          "Get current order error:",
          error?.response?.data || error.message,
        );
      }
    }
  };

  /*  ACCEPT ASSIGNMENT */

  const acceptOrder = async (assignmentId) => {
    if (!assignmentId) return;

    setAccepting(true);
    setErrorMessage("");

    try {
      const result = await axios.put(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        {},
        {
          withCredentials: true,
        },
      );

      console.log("Accept order:", result.data);

      await getCurrentOrder();
      await getAssignments();
    } catch (error) {
      console.log(
        "Accept order error:",
        error?.response?.data || error.message,
      );

      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to accept this delivery. It may already be accepted.",
      );

      await getAssignments();
      await getCurrentOrder();
    } finally {
      setAccepting(false);
    }
  };

  /*   UPDATE DELIVERY STATUS */

  const updateDeliveryStatus = async (status) => {
    if (!currentOrder?._id) return;

    setUpdatingStatus(true);
    setErrorMessage("");
    setMessage("");

    try {
      const result = await axios.put(
        `${serverUrl}/api/order/update-delivery-status/${currentOrder._id}`,
        {
          status: "picked_up",
        },
        {
          withCredentials: true,
        },
      );

      console.log("Delivery status:", result.data);

      setMessage(result.data?.message || `Order marked as ${status}.`);

      await getCurrentOrder();
    } catch (error) {
      console.log(
        "Update delivery status error:",
        error?.response?.data || error.message,
      );

      setErrorMessage(
        error?.response?.data?.message || "Unable to update delivery status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  /*  SEND DELIVERY OTP */

  const sendOtp = async () => {
    if (!currentOrder?._id) return;

    setLoading(true);
    setErrorMessage("");
    setMessage("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
        },
        {
          withCredentials: true,
        },
      );

      console.log("OTP response:", result.data);

      setShowOtpBox(true);

      setMessage(result.data?.message || "OTP has been sent to the customer.");
    } catch (error) {
      console.log("Send OTP error:", error?.response?.data || error.message);

      setErrorMessage(
        error?.response?.data?.message || "Unable to send delivery OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*   VERIFY DELIVERY OTP */

  const verifyOtp = async () => {
    if (!currentOrder?._id || !otp.trim()) {
      setErrorMessage("Please enter the OTP.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setMessage("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          otp: otp.trim(),
        },
        {
          withCredentials: true,
        },
      );

      console.log("Verify OTP:", result.data);

      setMessage(result.data?.message || "Order delivered successfully.");

      setOtp("");
      setShowOtpBox(false);

      await getCurrentOrder();
      await getAssignments();
      await handleTodayDeliveries();
    } catch (error) {
      console.log("Verify OTP error:", error?.response?.data || error.message);

      setErrorMessage(
        error?.response?.data?.message || "Invalid or expired OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*  TODAY'S DELIVERIES */

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        {
          withCredentials: true,
        },
      );

      const deliveries = result.data?.deliveries || result.data || [];

      setTodayDeliveries(deliveries);
    } catch (error) {
      console.log(
        "Today's deliveries error:",
        error?.response?.data || error.message,
      );
    }
  };

  /*  INITIAL DATA */

  useEffect(() => {
    if (!userData?._id) return;

    getAssignments();
    getCurrentOrder();
    handleTodayDeliveries();
  }, [userData?._id]);

  /*  POLLING
     No Socket.IO for now */

  useEffect(() => {
    if (!userData?._id) return;

    const interval = setInterval(() => {
      getAssignments();
      getCurrentOrder();
    }, 10000);

    return () => clearInterval(interval);
  }, [userData?._id]);

  /*   EARNINGS */

  const ratePerDelivery = 50;

  const totalEarning = todayDeliveries.reduce(
    (sum, delivery) => sum + Number(delivery.count || 0) * ratePerDelivery,
    0,
  );

  /*  HELPERS */

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "assigned":
        return "Assigned";

      case "accepted":
        return "Accepted";

      case "picked_up":
        return "Picked Up";

      case "delivered":
        return "Delivered";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  const getAssignmentId = (assignment) => {
    return assignment?._id || assignment?.assignmentId;
  };

  const getOrderFromAssignment = (assignment) => {
    return assignment?.order || {};
  };

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <div className="w-full max-w-3xl flex flex-col gap-5 items-center py-5">
        {/*   WELCOME */}

        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData?.fullName}
          </h1>

          <p className="text-[#ff4d2d] text-sm">
            <span className="font-semibold">Latitude:</span>{" "}
            {deliveryBoyLocation?.lat
              ? deliveryBoyLocation.lat.toFixed(6)
              : "Not available"}
            {" | "}
            <span className="font-semibold">Longitude:</span>{" "}
            {deliveryBoyLocation?.lon
              ? deliveryBoyLocation.lon.toFixed(6)
              : "Not available"}
          </p>
        </div>

        {/*  ERROR / SUCCESS MESSAGE */}

        {errorMessage && (
          <div className="w-[90%] bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {errorMessage}
          </div>
        )}

        {message && (
          <div className="w-[90%] bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm">
            {message}
          </div>
        )}

        {/*  TODAY'S DELIVERIES */}

        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] border border-orange-100">
          <h1 className="text-lg font-bold mb-3 text-[#ff4d2d]">
            Today's Deliveries
          </h1>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={todayDeliveries}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />

              <YAxis allowDecimals={false} />

              <Tooltip
                formatter={(value) => [value, "orders"]}
                labelFormatter={(label) => `${label}:00`}
              />

              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>

          <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center border">
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Today's Earnings
            </h1>

            <span className="text-3xl font-bold text-green-600">
              ₹{totalEarning}
            </span>
          </div>
        </div>

        {/*  AVAILABLE ORDERS */}

        {!currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-bold flex items-center gap-2">
                📦 Available Orders
              </h1>

              <button
                onClick={getAssignments}
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-4">
              {availableAssignments.length > 0 ? (
                availableAssignments.map((assignment) => {
                  const order = getOrderFromAssignment(assignment);

                  const assignmentId = getAssignmentId(assignment);

                  return (
                    <div className="border rounded-xl p-4" key={assignmentId}>
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            Order #
                            {String(order?._id || "")
                              .slice(-6)
                              .toUpperCase()}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-semibold">
                              Delivery Address:
                            </span>{" "}
                            {[
                              currentOrder?.deliveryAddress?.address,
                              currentOrder?.deliveryAddress?.landmark,
                              currentOrder?.deliveryAddress?.city,
                              currentOrder?.deliveryAddress?.state,
                              currentOrder?.deliveryAddress?.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Address unavailable"}
                          </p>

                          <p className="text-xs text-gray-400 mt-2">
                            {order?.items?.length ||
                              assignment?.items?.length ||
                              0}{" "}
                            items
                          </p>

                          <p className="text-sm font-semibold text-gray-700 mt-1">
                            ₹
                            {Number(
                              order?.totalAmount ||
                                order?.total ||
                                order?.subtotal ||
                                assignment?.totalAmount ||
                                0,
                            ).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                            {getStatusLabel(assignment.status)}
                          </span>

                          <button
                            disabled={accepting || !assignmentId}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => acceptOrder(assignmentId)}
                          >
                            {accepting ? (
                              <ClipLoader size={16} color="white" />
                            ) : (
                              "Accept"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No Available Orders.</p>

                  <p className="text-gray-300 text-xs mt-1">
                    New orders will appear automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/*   CURRENT ORDER */}

        {currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">📦 Current Order</h2>

              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600 font-semibold">
                {getStatusLabel(currentOrder.orderStatus)}
              </span>
            </div>

            {/* ORDER INFO */}

            <div className="border rounded-xl p-4 mb-4">
              <p className="font-semibold text-sm">
                Order #
                {String(currentOrder._id || "")
                  .slice(-6)
                  .toUpperCase()}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                <span className="font-semibold">Customer:</span>{" "}
                {currentOrder.user?.fullName ||
                  currentOrder.customer?.fullName ||
                  "Customer"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-semibold">Mobile::</span>{" "}
                {currentOrder.user?.mobile ||
                  currentOrder.customer?.mobile ||
                  "mobile"}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold">Delivery Address:</span>{" "}
                {[
                  currentOrder.deliveryAddress?.address,
                  currentOrder.deliveryAddress?.landmark,
                  currentOrder.deliveryAddress?.city,
                  currentOrder.deliveryAddress?.state,
                  currentOrder.deliveryAddress?.pincode,
                ]
                  .filter(Boolean)
                  .join(", ") || "Address unavailable"}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold">Items:</span>{" "}
                {currentOrder.items?.length || 0}
              </p>

              <p className="text-sm font-semibold text-gray-700 mt-1">
                Total: ₹
                {Number(
                  currentOrder.totalAmount ||
                    currentOrder.total ||
                    currentOrder.subtotal ||
                    0,
                ).toFixed(2)}
              </p>
            </div>

            {/* ITEMS */}

            {currentOrder.items?.length > 0 && (
              <div className="border rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-sm mb-3">Order Items</h3>

                <div className="space-y-2">
                  {currentOrder.items.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {item.item?.name || item.name || "Item"} ×{" "}
                        {item.quantity || 1}
                      </span>

                      <span className="font-medium">
                        ₹{Number(item.price || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/*  TRACKING */}

            {currentOrder.deliveryAddress?.latitude &&
              currentOrder.deliveryAddress?.longitude && (
                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation: deliveryBoyLocation || {
                      lat: userData?.location?.coordinates?.[1] || 0,
                      lon: userData?.location?.coordinates?.[0] || 0,
                    },

                    customerLocation: {
                      lat: Number(currentOrder.deliveryAddress.latitude),

                      lon: Number(currentOrder.deliveryAddress.longitude),
                    },
                  }}
                />
              )}

            {/*   PICK UP */}

            {currentOrder.orderStatus === "out_for_delivery" && (
              <button
                disabled={updatingStatus}
                onClick={updateDeliveryStatus}
                className="mt-4 w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-600 disabled:opacity-50"
              >
                {updatingStatus ? (
                  <ClipLoader size={20} color="white" />
                ) : (
                  "📦 Mark As Picked Up"
                )}
              </button>
            )}

            {/*    OTP / DELIVERY */}

            {currentOrder.orderStatus === "picked_up" && (
              <>
                {!showOtpBox ? (
                  <button
                    className="mt-4 w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-green-600 disabled:opacity-50"
                    onClick={sendOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <ClipLoader size={20} color="white" />
                    ) : (
                      "🔐 Send Delivery OTP"
                    )}
                  </button>
                ) : (
                  <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                    <p className="text-sm font-semibold mb-2">
                      Enter OTP given by{" "}
                      <span className="text-orange-500">
                        {currentOrder.user?.fullName || "customer"}
                      </span>
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full border px-3 py-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-center tracking-[0.5em] text-lg"
                      placeholder="••••••"
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      value={otp}
                    />

                    <button
                      className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
                      onClick={verifyOtp}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <ClipLoader size={20} color="white" />
                      ) : (
                        "Verify OTP & Deliver"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={loading}
                      className="w-full mt-2 text-sm text-orange-500 hover:text-orange-600"
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoy;
