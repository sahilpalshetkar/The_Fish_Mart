import React from "react";
import { useNavigate } from "react-router-dom";
import { categories } from ".././category.js";

const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <section className="bg-linear-to-r from-[#0369A1] to-[#0284C7] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-100 mb-3">
              Fresh From The Sea
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Explore Our
              <span className="block text-cyan-100">Seafood Categories</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-blue-100 leading-relaxed">
              Choose from our wide selection of fresh fish and premium seafood,
              cleaned and delivered fresh to your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[#0369A1] font-semibold text-sm uppercase tracking-wide">
              Shop by category
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
              Find Your Favourite Seafood
            </h2>
          </div>

          <span className="hidden sm:block text-sm text-slate-500">
            {categories.length} categories
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className="group text-left bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                {/* Category name */}
                <div className="absolute bottom-4 left-5">
                  <h3 className="text-xl font-bold text-white">
                    {category.name}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-sm text-slate-500">{category.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#0369A1]">
                    Explore {category.name}
                  </span>

                  <span className="w-9 h-9 rounded-full bg-[#F0F9FF] flex items-center justify-center text-[#0369A1] group-hover:bg-[#0369A1] group-hover:text-white transition">
                    →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-3xl bg-[#E0F2FE] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Can't decide what to order?
            </h2>

            <p className="mt-2 text-slate-600">
              Browse all our fresh seafood products.
            </p>
          </div>

          <button
            onClick={() => navigate("/All-products")}
            className="shrink-0 bg-[#0369A1] hover:bg-[#075985] text-white px-7 py-3.5 rounded-xl font-semibold transition"
          >
            Shop All Seafood
          </button>
        </div>
      </section>
    </div>
  );
};

export default Categories;
