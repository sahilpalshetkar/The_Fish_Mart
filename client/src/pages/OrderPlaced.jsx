import React from "react";
import {
  FaCheck,
  FaArrowRight,
  FaTruckFast,
  FaFish,
  FaBoxOpen,
} from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";

const OrderPlaced = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* SUCCESS ICON */}
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
              <FaCheck className="text-3xl" />
            </div>
          </div>
        </div>

        {/* HEADING */}
        <h1 className="mt-8 text-3xl font-bold text-slate-900 sm:text-4xl">
          Order Placed Successfully!
        </h1>

        <p className="mt-3 max-w-lg text-slate-500">
          Thank you for ordering from The Fishy Mart. Your fresh seafood order
          has been received and we're getting it ready for you.
        </p>

        {/* ORDER ID */}
        {orderId && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Order ID
            </p>

            <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
              #{orderId}
            </p>
          </div>
        )}

        {/* STATUS CARD */}
        <div className="mt-8 w-full rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">What's next?</h2>

          <div className="mt-6 space-y-6">
            {/* CONFIRMED */}
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                <FaCheck />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Order Confirmed
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  We've received your order successfully.
                </p>
              </div>
            </div>

            {/* PREPARING */}
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                <FaBoxOpen />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Fresh Seafood Preparation
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your seafood will be freshly prepared and carefully packed.
                </p>
              </div>
            </div>

            {/* DELIVERY */}
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <FaTruckFast />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">Fast Delivery</h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your order will be delivered fresh to your doorstep.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-cyan-500 hover:text-cyan-600"
          >
            View My Orders
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3.5 font-semibold text-white transition hover:bg-cyan-700"
          >
            Continue Shopping
            <FaArrowRight />
          </button>
        </div>

        {/* FOOTER MESSAGE */}
        <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
          <FaFish className="text-cyan-500" />
          <span>Fresh fish. Fast delivery. Straight to your door.</span>
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;
