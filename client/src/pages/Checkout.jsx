import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaLocationDot,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaShieldHeart,
  FaFish,
  FaTruckFast,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { serverUrl } from "../App";
import { addMyOrder } from "../redux/orderSlice";
import { clearCart } from "../redux/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, totalAmount } = useSelector((state) => state.cart);

  const {
    userData,
    currentAddress,
    currentCity,
    currentState,
    currentPincode,
  } = useSelector((state) => state.user);

  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const subtotal = Number(totalAmount || 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const [formData, setFormData] = useState({
    fullName: userData?.fullName || "",
    mobile: userData?.mobile || "",
    email: userData?.email || "",
    address: currentAddress || "",
    landmark: "",
    city: currentCity || "",
    state: currentState || "",
    pincode: currentPincode || "",
  });

  useEffect(() => {
    const checkPincode = async () => {
      if (!/^\d{6}$/.test(formData.pincode)) {
        setPincodeStatus(null);
        return;
      }

      try {
        setCheckingPincode(true);

        const result = await axios.get(
          `${serverUrl}/api/delivery/check-pincode/${formData.pincode}`,
          {
            withCredentials: true,
          },
        );

        setPincodeStatus(result.data);
      } catch (error) {
        setPincodeStatus({
          serviceable: false,
          message: error.response?.data?.message || "Unable to check pincode.",
        });
      } finally {
        setCheckingPincode(false);
      }
    };

    checkPincode();
  }, [formData.pincode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (placingOrder) {
      return;
    }

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.mobile.trim()) {
      toast.error("Please enter your mobile number");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    if (!formData.city.trim()) {
      toast.error("Please enter your city");
      return;
    }

    if (!formData.state.trim()) {
      toast.error("Please enter your state");
      return;
    }

    if (pincodeStatus?.serviceable !== true) {
      toast.error("Sorry, we don't deliver to this pincode.");
      return;
    }

    try {
      setPlacingOrder(true);

      const deliveryAddress = {
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        landmark: formData.landmark.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };

      const response = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          cartItems,
          paymentMethod,
          deliveryAddress,
        },
        {
          withCredentials: true,
        },
      );

      if (paymentMethod === "cod") {
        dispatch(addMyOrder(response.data.order));

        await clearCartFromDatabase();

        navigate("/order-placed", {
          state: {
            orderId: response.data.order?._id,
          },
        });

        return;
      }

      const { orderId, razorOrder } = response.data;

      openRazorpayWindow(orderId, razorOrder);
    } catch (error) {
      console.error("Place order error:", error.response?.data || error);

      toast.error(
        error.response?.data?.message ||
          "Something went wrong while placing your order. Please try again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: razorOrder.amount,
      currency: razorOrder.currency || "INR",
      name: "The Fishy Mart",
      description: "Fish delivery order payment",
      order_id: razorOrder.id,

      handler: async function (response) {
        try {
          setPlacingOrder(true);

          const result = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            },
            {
              withCredentials: true,
            },
          );

          if (!result.data.success) {
            throw new Error(
              result.data.message || "Payment verification failed.",
            );
          }

          dispatch(addMyOrder(result.data.order));

          await clearCartFromDatabase();

          navigate("/order-placed", {
            state: {
              orderId: result.data.order?._id || orderId,
            },
          });
        } catch (error) {
          console.error(
            "Payment verification error:",
            error.response?.data || error,
          );

          toast.error(
            error.response?.data?.message ||
              "Payment verification failed. Please contact support if money was deducted.",
          );
        } finally {
          setPlacingOrder(false);
        }
      },

      modal: {
        ondismiss: function () {
          setPlacingOrder(false);
          toast("Payment cancelled");
        },
      },

      theme: {
        color: "#0369A1",
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      setPlacingOrder(false);

      toast.error(
        response.error?.description || "Payment failed. Please try again.",
      );
    });

    rzp.open();
  };

  //clear cart function
  const clearCartFromDatabase = async () => {
    try {
      await axios.delete(`${serverUrl}/api/cart/clear`, {
        withCredentials: true,
      });

      dispatch(clearCart());
    } catch (error) {
      console.error("Clear cart error:", error.response?.data || error);
    }
  };

  // EMPTY CART
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-6 py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
            <FaFish className="text-4xl" />
          </div>

          <h1 className="mt-7 text-3xl font-bold text-slate-900">
            Your cart is empty
          </h1>

          <p className="mt-3 max-w-md text-slate-500">
            Add some fresh seafood to your cart before proceeding to checkout.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-8 flex items-center gap-3 rounded-xl bg-cyan-600 px-7 py-3.5 font-semibold text-white transition hover:bg-cyan-700"
          >
            Browse Seafood
            <FaArrowRight />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
          <button
            onClick={() => navigate("/cart")}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-cyan-600"
          >
            <FaArrowLeft />
            Back to Cart
          </button>

          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-slate-500">
            Enter your delivery details to complete your order.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* LEFT */}
            <div className="space-y-6">
              {/* DELIVERY DETAILS */}
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                    <FaLocationDot />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Delivery Details
                    </h2>

                    <p className="text-sm text-slate-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {/* FULL NAME */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name
                    </label>

                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                  {/* MOBILE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Mobile Number
                    </label>

                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>

                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Delivery Address
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="House / Flat No., Building, Street, Area"
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  {/* LANDMARK */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Landmark
                      <span className="ml-1 font-normal text-slate-400">
                        (Optional)
                      </span>
                    </label>

                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="Nearby landmark"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  {/* CITY */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  {/* STATE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />
                  </div>

                  {/* PINCODE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Pincode
                    </label>

                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);

                        setFormData((prev) => ({
                          ...prev,
                          pincode: value,
                        }));

                        setPincodeStatus(null);
                      }}
                      placeholder="Enter pincode"
                      className={`h-11 w-full rounded-xl border px-4 text-sm outline-none transition ${
                        pincodeStatus?.serviceable === false
                          ? "border-red-400 bg-red-50 text-red-700 focus:border-red-500"
                          : pincodeStatus?.serviceable === true
                            ? "border-green-400 bg-green-50 text-green-700 focus:border-green-500"
                            : "border-slate-200 bg-white text-slate-700 focus:border-[#0369A1]"
                      }`}
                    />

                    {checkingPincode && (
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Checking delivery availability...
                      </p>
                    )}

                    {!checkingPincode &&
                      pincodeStatus?.serviceable === false && (
                        <p className="mt-2 text-xs font-semibold text-red-500">
                          ⚠ We don't deliver to this address.
                        </p>
                      )}

                    {!checkingPincode &&
                      pincodeStatus?.serviceable === true && (
                        <p className="mt-2 text-xs font-semibold text-green-600">
                          ✓ We deliver to this address.
                        </p>
                      )}
                  </div>
                </div>
              </section>

              {/* DELIVERY INFO */}
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <FaTruckFast />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">Fresh Delivery</h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Your seafood will be carefully packed and delivered fresh
                      to your doorstep.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT - ORDER SUMMARY */}
            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">
                  Order Summary
                </h2>

                {/* ITEMS */}
                <div className="mt-6 max-h-80 space-y-4 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      {/* IMAGE */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl text-slate-300">
                            <FaFish />
                          </div>
                        )}
                      </div>

                      {/* INFO */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Qty: {item.quantity}
                        </p>

                        {item.variant && (
                          <p className="mt-1 text-xs text-slate-400">
                            {item.variant.size}
                            {item.variant.weight
                              ? ` • ${item.variant.weight}${item.variant.weightUnit}`
                              : ""}
                          </p>
                        )}
                      </div>

                      {/* PRICE */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          ₹
                          {(
                            Number(item.price) * Number(item.quantity)
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTALS */}
                <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>

                    <span className="font-medium text-slate-900">
                      ₹{Number(totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Delivery</span>

                    <span className="font-medium text-green-600">Free</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="font-semibold text-slate-900">Total</span>

                    <span className="text-2xl font-bold text-cyan-600">
                      ₹{Number(totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* PAYMENT METHOD */}
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Payment Method
                  </label>

                  <div className="space-y-3">
                    {/* CASH ON DELIVERY */}
                    <label
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                        paymentMethod === "cod"
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="h-4 w-4 accent-cyan-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Cash on Delivery
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Pay when your order is delivered
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold text-slate-600">
                        COD
                      </span>
                    </label>

                    {/* ONLINE PAYMENT */}
                    <label
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                        paymentMethod === "online"
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online"
                          checked={paymentMethod === "online"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="h-4 w-4 accent-cyan-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            UPI / Credit / Debit Card
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Pay securely using Razorpay
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* PLACE ORDER */}
                <button
                  type="submit"
                  disabled={placingOrder}
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-600 px-6 py-4 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placingOrder ? (
                    "Processing..."
                  ) : (
                    <>
                      {paymentMethod === "cod"
                        ? "Place Order"
                        : "Pay & Place Order"}

                      <FaArrowRight />
                    </>
                  )}
                </button>

                {/* SECURITY */}
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                      <FaShieldHeart />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Secure Checkout
                      </p>

                      <p className="text-xs text-slate-400">
                        Your information is protected
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
