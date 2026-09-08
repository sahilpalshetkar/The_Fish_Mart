import React from "react";
import {
  FaFish,
  FaShieldHalved,
  FaTruckFast,
  FaSnowflake,
  FaHandSparkles,
  FaClock,
} from "react-icons/fa6";

const features = [
  {
    icon: <FaFish />,
    title: "Freshly Sourced",
    description:
      "We source quality seafood to bring you fresh fish with great taste and texture.",
  },
  {
    icon: <FaHandSparkles />,
    title: "Hygienically Cleaned",
    description:
      "Every order is carefully cleaned and prepared before it reaches your kitchen.",
  },
  {
    icon: <FaSnowflake />,
    title: "Freshly Packed",
    description:
      "Your seafood is packed with care to maintain freshness during delivery.",
  },
  {
    icon: <FaTruckFast />,
    title: "Fast Delivery",
    description:
      "Get your fresh seafood delivered conveniently to your doorstep across Mumbai.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-12 sm:py-20">
      {/* Background decoration */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#E0F2FE] rounded-full blur-3xl opacity-70" />

      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#E0F2FE] rounded-full blur-3xl opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-0.5 bg-[#0369A1]" />

            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#0369A1]">
              Why Us
            </span>

            <span className="w-8 h-0.5 bg-[#0369A1]" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Freshness You Can Trust
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
            From sourcing to delivery, we take care of every step to make sure
            you receive seafood that's fresh, clean and ready to cook.
          </p>
        </div>
        {/* Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 hover:border-[#BAE6FD] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              {/* Number */}
              <span className="absolute top-3 right-3 sm:top-5 sm:right-5 text-[10px] sm:text-xs font-bold text-slate-200">
                0{index + 1}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center text-base sm:text-xl group-hover:bg-[#0369A1] group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="mt-3 sm:mt-5 text-sm sm:text-lg font-bold text-slate-800 group-hover:text-[#0369A1] transition-colors leading-tight">
                {feature.title}
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom line */}
              <div className="mt-4 sm:mt-5 w-8 h-1 rounded-full bg-[#E0F2FE] group-hover:w-14 group-hover:bg-[#0369A1] transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
