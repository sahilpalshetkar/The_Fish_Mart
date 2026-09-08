import React, { useState } from "react";
import {
  FaFish,
  FaMagnifyingGlass,
  FaCartShopping,
  FaUser,
  FaBars,
  FaXmark,
  FaLocationDot,
  FaChevronDown,
} from "react-icons/fa6";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const { userData, cartItems } = useSelector((state) => state.user);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cartCount = cartItems?.length || 0;

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenu(false);
  };

  return (
    <>
      {/*  TOP BAR  */}
      <div className="hidden md:block bg-[#0369A1] text-white">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FaLocationDot />
            <span>Fresh Seafood Delivered Across Mumbai</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Freshly Caught</span>
            <span>•</span>
            <span>Cleaned & Packed</span>
            <span>•</span>
            <span>Same Day Delivery</span>
          </div>
        </div>
      </div>

      {/*  NAVBAR  */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-6">
            {/* LOGO */}
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-3 shrink-0"
            >
              <div className="w-11 h-11 rounded-xl bg-[#0369A1] flex items-center justify-center text-white shadow-sm">
                <FaFish className="text-xl" />
              </div>

              <div className="text-left">
                <h1 className="text-xl font-extrabold text-[#0F172A] leading-none">
                  Fish<span className="text-[#0369A1]">Fresh</span>
                </h1>

                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">
                  Fresh from the sea
                </p>
              </div>
            </button>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden lg:flex items-center gap-7">
              <button
                onClick={() => handleNavigation("/")}
                className="text-sm font-semibold text-[#0369A1] hover:text-[#0284C7] transition"
              >
                Home
              </button>

              <button
                onClick={() => handleNavigation("/shop")}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0369A1] transition"
              >
                Shop
                <FaChevronDown className="text-[9px]" />
              </button>

              <button
                onClick={() => handleNavigation("/categories")}
                className="text-sm font-medium text-slate-600 hover:text-[#0369A1] transition"
              >
                Categories
              </button>

              <button
                onClick={() => handleNavigation("/offers")}
                className="text-sm font-medium text-slate-600 hover:text-[#0369A1] transition"
              >
                Offers
              </button>

              <button
                onClick={() => handleNavigation("/about")}
                className="text-sm font-medium text-slate-600 hover:text-[#0369A1] transition"
              >
                About Us
              </button>
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* SEARCH */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-[#0369A1] transition"
              >
                <FaMagnifyingGlass />
              </button>

              {/* USER */}
              <button
                onClick={() =>
                  handleNavigation(userData ? "/profile" : "/login")
                }
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
              >
                <div className="w-9 h-9 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0369A1]">
                  <FaUser className="text-sm" />
                </div>

                <div className="hidden xl:block text-left">
                  <p className="text-[10px] text-slate-400">
                    {userData ? "Welcome back" : "Welcome"}
                  </p>

                  <p className="text-xs font-semibold text-slate-700">
                    {userData ? userData.fullName?.split(" ")[0] : "Login"}
                  </p>
                </div>
              </button>

              {/* CART */}
              <button
                onClick={() => handleNavigation("/cart")}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-[#0369A1] transition"
              >
                <FaCartShopping />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* MOBILE MENU */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
              >
                {mobileMenu ? <FaXmark /> : <FaBars />}
              </button>
            </div>
          </div>

          {/*  SEARCH BAR  */}
          {searchOpen && (
            <div className="pb-4">
              <div className="relative">
                <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search fish, prawns, seafood..."
                  autoFocus
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/10 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/*  MOBILE MENU  */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-slate-100 bg-white">
            <div className="px-5 py-5 flex flex-col gap-1">
              <button
                onClick={() => handleNavigation("/")}
                className="text-left px-4 py-3 rounded-xl text-sm font-semibold text-[#0369A1] bg-[#F0F9FF]"
              >
                Home
              </button>

              <button
                onClick={() => handleNavigation("/shop")}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Shop
              </button>

              <button
                onClick={() => handleNavigation("/categories")}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Categories
              </button>

              <button
                onClick={() => handleNavigation("/offers")}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Offers
              </button>

              <button
                onClick={() => handleNavigation("/about")}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                About Us
              </button>

              <div className="h-px bg-slate-100 my-2" />

              <button
                onClick={() =>
                  handleNavigation(userData ? "/profile" : "/login")
                }
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <FaUser />
                {userData ? "My Profile" : "Login"}
              </button>

              <button
                onClick={() => handleNavigation("/cart")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <FaCartShopping />
                Cart
                {cartCount > 0 && (
                  <span className="ml-auto bg-[#F97316] text-white text-xs px-2 py-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
