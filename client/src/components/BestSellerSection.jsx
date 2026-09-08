import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowRight, FaEye, FaStar } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";

const BestSellerSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${serverUrl}/api/item/best-sellers`, {
          withCredentials: true,
        });

        setItems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(
          "Failed to fetch best sellers:",
          error?.response?.data || error.message,
        );

        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const handleViewProduct = (itemId) => {
    navigate(`/product/${itemId}`);
  };

  // Get lowest available variant price
  const getStartingPrice = (item) => {
    const availableVariants =
      item.variants?.filter((variant) => variant.isAvailable !== false) || [];

    if (!availableVariants.length) {
      return null;
    }

    return Math.min(
      ...availableVariants.map((variant) => Number(variant.price)),
    );
  };

  if (loading) {
    return (
      <section className="px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="h-4 w-64 bg-slate-200 rounded mt-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-4/3 bg-slate-200" />

                <div className="p-4 space-y-3">
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                  <div className="h-5 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />

                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 w-20 bg-slate-200 rounded" />
                    <div className="h-10 w-20 bg-slate-200 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <section className="px-4 md:px-8 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-0.5 bg-[#0369A1]" />

              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#0369A1]">
                Customer Favorites
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Best Sellers
            </h2>

            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Our customers' most-loved fresh fishes
            </p>
          </div>

          <button
            onClick={() => navigate("/all-products")}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#0369A1] hover:text-[#075985] transition group"
          >
            View All
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => {
            const isAvailable = item.isAvailable !== false;

            const startingPrice = getStartingPrice(item);

            // If all variants are unavailable
            const hasAvailableVariant = item.variants?.some(
              (variant) => variant.isAvailable !== false,
            );

            const productAvailable = isAvailable && hasAvailableVariant;

            return (
              <div
                key={item._id}
                onClick={() => productAvailable && handleViewProduct(item._id)}
                className={`group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 ${
                  productAvailable
                    ? "hover:border-[#BAE6FD] hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer"
                    : "cursor-not-allowed"
                }`}
              >
                {/* Image */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      productAvailable ? "group-hover:scale-105" : "grayscale"
                    }`}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Best Seller */}
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Best Seller
                  </span>

                  {/* Category */}
                  {item.category && (
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[#0369A1] px-2.5 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold shadow-sm">
                      {item.category}
                    </span>
                  )}

                  {/* Unavailable */}
                  {!productAvailable && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-slate-700 px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold shadow-lg">
                        Currently Unavailable
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <FaStar className="text-[#F59E0B] text-[10px]" />

                    <span className="text-[11px] font-semibold text-slate-600">
                      {item.averageRating || "4.8"}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      ({item.reviewCount || 24})
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-sm sm:text-base text-slate-800 truncate group-hover:text-[#0369A1] transition-colors">
                    {item.name}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-2 min-h-7.5">
                      {item.description}
                    </p>
                  )}

                  {/* Price + Button */}
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <div>
                      {startingPrice !== null ? (
                        <>
                          <p className="text-lg font-extrabold text-[#0F172A]">
                            ₹{startingPrice}
                          </p>

                          <p className="text-[10px] text-slate-400">
                            starting price
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-slate-400">
                          Unavailable
                        </p>
                      )}
                    </div>

                    {/* View Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        if (productAvailable) {
                          handleViewProduct(item._id);
                        }
                      }}
                      disabled={!productAvailable}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                        !productAvailable
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-[#0369A1] text-white hover:bg-[#075985] hover:scale-105"
                      }`}
                    >
                      <FaEye className="text-xs" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View All */}
        <button
          onClick={() => navigate("/all-products")}
          className="sm:hidden w-full mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-[#0369A1] hover:text-[#075985] transition"
        >
          View All
          <FaArrowRight className="text-xs" />
        </button>
      </div>
    </section>
  );
};

export default BestSellerSection;
