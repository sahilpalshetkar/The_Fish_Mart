import React from "react";
import {
  FaArrowRight,
  FaFish,
  FaShrimp,
  FaDrumstickBite,
  FaBowlFood,
  FaBoxOpen,
  FaUtensils,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { categories } from "../category.js";

const CategorySection = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/all-products?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*  HEADER  */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-9">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-0.5 bg-[#0369A1]" />

              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#0369A1]">
                Explore
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Shop by Category
            </h2>

            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Find your favourite seafood, all in one place.
            </p>
          </div>

          <button
            onClick={() => navigate("/categories")}
            className="group flex items-center gap-2 text-sm font-semibold text-[#0369A1] hover:text-[#075985] transition w-fit"
          >
            View All Categories
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/*  CATEGORY GRID  */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className="group text-left rounded-2xl overflow-hidden bg-white border border-slate-100 hover:border-[#BAE6FD] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              {/* IMAGE */}
              <div className="relative h-36 sm:h-40 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* CONTENT */}
              <div className="p-3.5">
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#0369A1] transition-colors">
                  {category.name}
                </h3>

                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {category.description}
                </p>

                <div className="flex items-center gap-1 mt-3 text-[11px] font-semibold text-[#0369A1]">
                  Shop Now
                  <FaArrowRight className="text-[8px] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/*  BOTTOM BANNER  */}
        <div className="mt-8 rounded-2xl bg-[#F0F9FF] border border-[#E0F2FE] px-5 py-4 sm:px-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#0369A1] flex items-center justify-center shadow-sm shrink-0">
              <FaFish />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Can't find what you're looking for?
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                Explore our complete collection of fresh seafood.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/all-products")}
            className="flex items-center gap-2 bg-[#0369A1] hover:bg-[#075985] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0"
          >
            View All Products
            <FaArrowRight className="text-[10px]" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
