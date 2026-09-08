import React from "react";
import {
  FaFish,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLocationDot,
  FaPhone,
  FaEnvelope,
  FaArrowRight,
  FaShieldHalved,
  FaTruckFast,
  FaClock,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-[#0F172A] text-white">
      {/*  TOP CTA  */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-[#0369A1] rounded-3xl px-6 sm:px-10 py-8 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-32 w-80 h-80 rounded-full border-50 border-white/5" />
            <div className="absolute -left-20 -bottom-40 w-72 h-72 rounded-full border-40 border-white/5" />

            {/* Trust Banner */}
            <div className="relative mt-8 sm:mt-12 overflow-hidden rounded-4xl bg-[#0369A1] px-5 py-7 sm:px-10 sm:py-10 lg:px-12">
              {/* Background decoration */}
              <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-55 border-white/6" />

              <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full border-45 border-white/5" />

              <div className="pointer-events-none absolute right-[30%] top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-white/3 blur-2xl" />

              {/* Content */}
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                {/* Left Content */}
                <div className="max-w-2xl">
                  {/* Label */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <FaShieldHalved className="text-sm text-[#BAE6FD]" />
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#BAE6FD]">
                      Our Promise
                    </span>
                  </div>

                  {/* Heading */}
                  <h3 className="max-w-xl text-white text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-[2.1rem]">
                    Quality seafood,
                    <span className="text-[#BAE6FD]"> every single time.</span>
                  </h3>

                  {/* Description */}
                  <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-[15px]">
                    We believe you shouldn't have to compromise on freshness.
                    That's why quality is at the heart of everything we do.
                  </p>
                </div>

                {/* Right Stats */}
                <div className="grid shrink-0 grid-cols-2 gap-3 sm:gap-4">
                  {/* Delivery */}
                  <div className="group rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-md transition duration-300 hover:bg-white/15 sm:min-w-36.25 sm:px-5 sm:py-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                      <FaClock className="text-[#BAE6FD]" />
                    </div>

                    <p className="text-white text-base font-extrabold leading-tight sm:text-lg">
                      Same Day
                    </p>

                    <p className="my-0.5 text-xs font-medium text-blue-200">
                      or
                    </p>

                    <p className="text-white text-base font-extrabold leading-tight sm:text-lg">
                      Next Day
                    </p>

                    <p className="mt-2 text-xs text-blue-100">Delivery</p>
                  </div>

                  {/* Freshness */}
                  <div className="group rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-md transition duration-300 hover:bg-white/15 sm:min-w-36.25 sm:px-5 sm:py-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                      <FaFish className="text-[#BAE6FD]" />
                    </div>
                    <p className="text-white text-xl font-extrabold sm:text-2xl">
                      100%
                    </p>
                    <p className="mt-1 text-xs text-blue-100">Fresh Seafood</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*  MAIN FOOTER  */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {/*  BRAND  */}
          <div className="lg:col-span-1">
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-[#0369A1] flex items-center justify-center">
                <FaFish className="text-xl" />
              </div>

              <div className="text-left">
                <h2 className="text-xl font-extrabold">
                  Fish<span className="text-[#38BDF8]">Fresh</span>
                </h2>

                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 mt-0.5">
                  Fresh from the sea
                </p>
              </div>
            </button>

            <p className="text-sm text-slate-400 leading-relaxed mt-5 max-w-xs">
              Bringing fresh, quality seafood from trusted sources to your
              kitchen with care, hygiene and convenience.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-6">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#0369A1] flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <FaFacebookF className="text-xs" />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#0369A1] flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <FaInstagram className="text-xs" />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#0369A1] flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <FaTwitter className="text-xs" />
              </a>

              <a
                href="#"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#0369A1] flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <FaYoutube className="text-xs" />
              </a>
            </div>
          </div>

          {/*  QUICK LINKS  */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Quick Links
            </h3>

            <div className="w-8 h-0.5 bg-[#0369A1] mt-3 mb-5" />

            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation("/")}
                  className="text-sm text-slate-400 hover:text-white transition"
                >
                  Home
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigation("/all-products")}
                  className="text-sm text-slate-400 hover:text-white transition"
                >
                  Shop
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigation("/categories")}
                  className="text-sm text-slate-400 hover:text-white transition"
                >
                  Categories
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigation("/offers")}
                  className="text-sm text-slate-400 hover:text-white transition"
                >
                  Offers
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigation("/about")}
                  className="text-sm text-slate-400 hover:text-white transition"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/*  CUSTOMER  */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Customer Care
            </h3>

            <div className="w-8 h-0.5 bg-[#0369A1] mt-3 mb-5" />

            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleNavigation("/my-orders")}
                  className="text-sm text-slate-400 hover:text-white transition"
                >
                  My Orders
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigation("/track-order")}
                  className="text-sm text-slate-400 hover:text-white transition"
                >
                  Track Order
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigation("/cart")}
                  className="text-sm text-slate-400 hover:text-white transition"
                >
                  My Cart
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigation("/faq")}
                  className="text-sm text-slate-400 hover:text-white transition"
                >
                  FAQs
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleNavigation("/contact")}
                  className="text-sm text-slate-400 hover:text-white transition"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/*  CONTACT  */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Contact Us
            </h3>

            <div className="w-8 h-0.5 bg-[#0369A1] mt-3 mb-5" />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#38BDF8] shrink-0">
                  <FaLocationDot className="text-xs" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Delivery Area</p>

                  <p className="text-sm text-slate-300 mt-1">
                    Mumbai & surrounding areas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#38BDF8] shrink-0">
                  <FaPhone className="text-xs" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Call Us</p>

                  <a
                    href="tel:+919999999999"
                    className="text-sm text-slate-300 hover:text-white transition mt-1 block"
                  >
                    +91 99999 99999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#38BDF8] shrink-0">
                  <FaEnvelope className="text-xs" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">Email</p>

                  <a
                    href="mailto:support@fishfresh.com"
                    className="text-sm text-slate-300 hover:text-white transition mt-1 block"
                  >
                    support@fishfresh.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  TRUST FEATURES  */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#38BDF8]">
                <FaShieldHalved />
              </div>

              <div>
                <p className="text-sm font-semibold">Secure Payments</p>

                <p className="text-xs text-slate-500 mt-0.5">
                  Safe & trusted checkout
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#38BDF8]">
                <FaTruckFast />
              </div>

              <div>
                <p className="text-sm font-semibold">Fresh Delivery</p>

                <p className="text-xs text-slate-500 mt-0.5">
                  Carefully delivered to you
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*  BOTTOM BAR  */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} FishFresh. All rights reserved.
            </p>

            <div className="flex items-center gap-5">
              <button
                onClick={() => handleNavigation("/privacy-policy")}
                className="text-xs text-slate-500 hover:text-white transition"
              >
                Privacy Policy
              </button>

              <button
                onClick={() => handleNavigation("/terms")}
                className="text-xs text-slate-500 hover:text-white transition"
              >
                Terms & Conditions
              </button>

              <button
                onClick={() => handleNavigation("/refund-policy")}
                className="text-xs text-slate-500 hover:text-white transition"
              >
                Refund Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
