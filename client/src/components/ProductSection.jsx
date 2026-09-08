import React, { useEffect, useState } from "react";
import { FaArrowRight, FaCartShopping, FaFish, FaStar } from "react-icons/fa6";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

import { serverUrl } from "../App";
import { setCart } from "../redux/cartSlice";

const ProductSection = ({ title, subtitle, category }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  //  GET ALL PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${serverUrl}/api/item/get-all-items`,
          {
            withCredentials: true,
          },
        );

        setProducts(response?.data?.items || []);
      } catch (error) {
        console.error(
          "Error fetching products:",
          error.response?.data || error.message,
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  //  FILTER BY CATEGORY
  const product = category
    ? products.filter((item) => item.category === category)
    : products;

  //  SHOW ALL PRODUCTS
  const displayedProducts = [...(product || [])].sort(
    () => Math.random() - 0.5,
  );

  //  CHECK CART
  const isInCart = (itemId) => {
    return cartItems?.some(
      (cartItem) => cartItem.item === itemId || cartItem.itemId === itemId,
    );
  };

  //  ADD TO CART
  const handleAddToCart = async (e, item) => {
    e.stopPropagation();

    try {
      if (!item?.isAvailable) {
        toast.error("This product is currently unavailable");
        return;
      }

      if (!item?.variants || item.variants.length === 0) {
        toast.error("No variants available for this product");
        return;
      }

      /*
       * DEFAULT SELECTIONS
       *
       * Weight      → 1kg
       * Cleaning    → Keep Whole
       * Size        → first available size
       * Quantity    → 1
       */

      //  DEFAULT SIZE
      const availableVariant = item.variants.find(
        (variant) =>
          variant.isAvailable &&
          Number(variant.weight) === 1 &&
          variant.weightUnit === "kg" &&
          variant.cleaningInstruction === "Keep Whole",
      );

      /*
       * If exact default combination exists,
       * use that variant.
       */
      let selectedVariant = availableVariant;

      //  FALLBACK
      /*
       * If 1kg + Keep Whole doesn't exist,
       * find any available variant.
       */
      if (!selectedVariant) {
        selectedVariant = item.variants.find((variant) => variant.isAvailable);
      }

      if (!selectedVariant) {
        toast.error("This product is currently unavailable");
        return;
      }

      const response = await axios.post(
        `${serverUrl}/api/cart/add`,
        {
          itemId: item._id,

          // Default / matched variant
          size: selectedVariant.size,
          weight: Number(selectedVariant.weight),
          weightUnit: selectedVariant.weightUnit,

          cleaning: selectedVariant.cleaningInstruction,

          quantity: 1,
        },
        {
          withCredentials: true,
        },
      );

      //  UPDATE REDUX
      dispatch(setCart(response.data.cart));

      toast.success(`${item.name} added to cart`);
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error(
        error.response?.data?.message || "Failed to add item to cart",
      );
    }
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
                Fresh Selection
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {title}
            </h2>

            {subtitle && (
              <p className="text-slate-500 mt-2 text-sm sm:text-base">
                {subtitle}
              </p>
            )}
          </div>

          {/*  VIEW ALL  */}
          <button
            onClick={() =>
              navigate(
                category
                  ? `/all-products?category=${encodeURIComponent(category)}`
                  : "/all-products",
              )
            }
            className="group flex items-center gap-2 text-sm font-semibold text-[#0369A1] hover:text-[#075985] transition w-fit"
          >
            View All
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/*  LOADING  */}
        {loading ? (
          <div className="flex gap-4 sm:gap-6 overflow-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="shrink-0 w-[75%] sm:w-[45%] md:w-[32%] lg:w-70 bg-white border border-slate-100 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-4/3 bg-slate-200" />

                <div className="p-4">
                  <div className="h-3 bg-slate-200 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-full mb-1" />
                  <div className="h-3 bg-slate-200 rounded w-2/3 mb-4" />

                  <div className="flex justify-between">
                    <div className="h-6 bg-slate-200 rounded w-20" />
                    <div className="h-10 w-10 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          /*  PRODUCTS  */
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {displayedProducts.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/product/${item._id}`)}
                className="group shrink-0 w-[75%] sm:w-[45%] md:w-[32%] lg:w-70 bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-[#BAE6FD] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer snap-start"
              >
                {/*  IMAGE  */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      !item.isAvailable ? "grayscale" : ""
                    }`}
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Availability */}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <span className="bg-white text-slate-700 px-4 py-2 rounded-lg text-xs font-bold">
                        Currently Unavailable
                      </span>
                    </div>
                  )}

                  {/* Category */}
                  {item.category && (
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#0369A1] px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                      {item.category}
                    </span>
                  )}

                  {/* Best Seller */}
                  {item.salesCount >= 10 && (
                    <span className="absolute top-3 right-3 bg-[#F59E0B] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                      Best Seller
                    </span>
                  )}
                </div>

                {/*  CONTENT  */}
                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <FaStar className="text-[#F59E0B] text-[10px]" />

                    <span className="text-[11px] font-semibold text-slate-600">
                      4.8
                    </span>

                    <span className="text-[10px] text-slate-400">(24)</span>
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

                  {/* Price + Cart */}
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <div>
                      <p className="text-lg font-bold text-[#0F172A]">
                        ₹{item.variants?.[0]?.price}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        Starting price per kg
                      </p>
                    </div>

                    {/*  CART BUTTON  */}
                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      disabled={!item.isAvailable}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        !item.isAvailable
                          ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                          : isInCart(item._id)
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : "bg-[#0369A1] text-white hover:bg-[#075985] hover:scale-105"
                      }`}
                    >
                      <FaCartShopping className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /*  EMPTY STATE  */
          <div className="border border-dashed border-slate-200 rounded-2xl py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F9FF] text-[#0369A1] flex items-center justify-center mb-4">
              <FaFish className="text-2xl" />
            </div>

            <h3 className="text-base font-bold text-slate-800">
              No seafood available right now
            </h3>

            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              We're working on bringing more fresh seafood to your area.
            </p>

            <button
              onClick={() => navigate("/shop")}
              className="mt-5 bg-[#0369A1] hover:bg-[#075985] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              Browse Shop
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
