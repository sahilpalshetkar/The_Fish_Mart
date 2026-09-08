import React from "react";
import { FaArrowRight, FaCheck, FaFish, FaTruckFast } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#F0F9FF]">
      {/* Background decorations */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#BAE6FD]/40 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#E0F2FE]/70 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-150 lg:min-h-170 grid lg:grid-cols-2 items-center gap-10 lg:gap-16 py-12 lg:py-16">
          {/*  LEFT CONTENT  */}
          <div className="order-2 lg:order-1 max-w-xl">
            {/* Small badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#BAE6FD] rounded-full px-4 py-2 shadow-sm mb-6">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E0F2FE] text-[#0369A1]">
                <FaFish className="text-xs" />
              </span>

              <span className="text-xs sm:text-sm font-semibold text-[#0369A1]">
                Fresh from the sea, delivered to you
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#0F172A] leading-[1.05]">
              Fresh Fish.
              <br />
              <span className="text-[#0369A1]">Straight to</span>
              <br />
              Your Kitchen.
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
              Premium quality seafood, freshly sourced, hygienically cleaned and
              carefully packed. Delivered fresh to your doorstep across Mumbai.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button
                onClick={() => navigate("/all-products")}
                className="group flex items-center gap-3 bg-[#0369A1] hover:bg-[#075985] text-white px-6 sm:px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base shadow-lg shadow-[#0369A1]/20 transition-all duration-300"
              >
                Shop Fresh Fish
                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/categories")}
                className="flex items-center gap-2 bg-white border border-slate-200 hover:border-[#7DD3FC] hover:bg-[#F8FDFF] text-slate-700 px-6 sm:px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300"
              >
                Explore Seafood
              </button>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-9">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                  <FaCheck className="text-[9px]" />
                </span>
                Freshly Sourced
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                  <FaCheck className="text-[9px]" />
                </span>
                Hygienically Cleaned
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
                  <FaCheck className="text-[9px]" />
                </span>
                Fast Delivery
              </div>
            </div>
          </div>

          {/*  RIGHT VIDEO  */}
          <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-150">
              {/* Decorative circle */}
              <div className="absolute inset-5 sm:inset-8 rounded-full bg-[#BAE6FD]/50" />

              {/* Video */}
              <div className="relative aspect-square overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl shadow-slate-300/40">
                <video
                  src="/videos/fishingboat2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-left"
                />

                {/* Video overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />
              </div>

              {/*  FLOATING DELIVERY CARD  */}
              <div className="absolute -left-2 sm:-left-8 bottom-20 sm:bottom-24 bg-white rounded-2xl shadow-xl shadow-slate-300/30 px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3 border border-slate-100">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                  <FaTruckFast />
                </div>

                <div>
                  <p className="text-xs text-slate-400">Delivery</p>

                  <p className="text-sm font-bold text-slate-800">Same Day</p>
                </div>
              </div>

              {/*  FLOATING FRESH CARD  */}
              <div className="absolute -right-2 sm:-right-6 top-10 bg-white rounded-2xl shadow-xl shadow-slate-300/30 px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />

                  <span className="text-xs sm:text-sm font-semibold text-slate-700">
                    Fresh Catch
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
