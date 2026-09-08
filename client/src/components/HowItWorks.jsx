import React from "react";
import {
  FaFish,
  FaMagnifyingGlass,
  FaHandSparkles,
  FaBoxOpen,
  FaTruckFast,
  FaArrowRight,
} from "react-icons/fa6";

const steps = [
  {
    number: "01",
    icon: <FaFish />,
    title: "Fresh Catch",
    description:
      "We source fresh seafood from trusted suppliers and local fish markets.",
  },
  {
    number: "02",
    icon: <FaMagnifyingGlass />,
    title: "Quality Check",
    description:
      "Every fish goes through a careful quality check before being prepared.",
  },
  {
    number: "03",
    icon: <FaHandSparkles />,
    title: "Clean & Pack",
    description:
      "Your seafood is cleaned according to your preference and packed hygienically.",
  },
  {
    number: "04",
    icon: <FaTruckFast />,
    title: "Delivered Fresh",
    description:
      "We deliver your order carefully to your doorstep, ready for your kitchen.",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*  HEADER  */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-0.5 bg-[#0369A1]" />

            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#0369A1]">
              Simple Process
            </span>

            <span className="w-8 h-0.5 bg-[#0369A1]" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            From The Sea To Your Door
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
            We take care of the entire journey so you can enjoy fresh, quality
            seafood without the hassle.
          </p>
        </div>

        {/*  STEPS  */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-11 left-[12%] right-[12%] h-px bg-[#BAE6FD]" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center group">
                {/*  ICON  */}
                <div className="relative flex justify-center">
                  {/* Step circle */}
                  <div className="relative z-10 w-22 h-22 rounded-full bg-white border-4 border-[#E0F2FE] flex items-center justify-center group-hover:border-[#0369A1] transition-all duration-300">
                    <div className="w-14 h-14 rounded-full bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center text-xl group-hover:bg-[#0369A1] group-hover:text-white transition-all duration-300">
                      {step.icon}
                    </div>
                  </div>

                  {/* Number */}
                  <span className="absolute z-20 -top-2 right-[calc(50%-48px)] bg-[#0369A1] text-white text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    {step.number}
                  </span>
                </div>

                {/*  CONTENT  */}
                <div className="mt-6 px-1 sm:px-3">
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-[#0369A1] transition-colors">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-9 -right-2 z-20 w-5 h-5 rounded-full bg-white items-center justify-center text-[#7DD3FC]">
                    <FaArrowRight className="text-[9px]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
