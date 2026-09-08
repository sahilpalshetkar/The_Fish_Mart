import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaMinus, FaPlus } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";
import { serverUrl } from "../App";
import { setCart } from "../redux/cartSlice";
import { useDispatch } from "react-redux";

const ProductDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");
  const [selectedCleaning, setSelectedCleaning] = useState("");

  const [quantity, setQuantity] = useState(1);

  // Fetch item
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${serverUrl}/api/item/get-by-id/${itemId}`,
          {
            withCredentials: true,
          },
        );

        setItem(response.data);
      } catch (error) {
        console.error("Get item error:", error);

        setError(error.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  // Get unique options from actual variants
  const sizes = useMemo(() => {
    if (!item?.variants) return [];

    return [...new Set(item.variants.map((variant) => variant.size))];
  }, [item]);

  const weights = useMemo(() => {
    if (!item?.variants) return [];

    const uniqueWeights = [];

    item.variants.forEach((variant) => {
      const exists = uniqueWeights.some(
        (weight) =>
          weight.weight === variant.weight &&
          weight.weightUnit === variant.weightUnit,
      );

      if (!exists) {
        uniqueWeights.push({
          weight: variant.weight,
          weightUnit: variant.weightUnit,
        });
      }
    });

    return uniqueWeights;
  }, [item]);

  const cleaningOptions = useMemo(() => {
    if (!item?.variants) return [];

    return [
      ...new Set(
        item.variants
          .map((variant) => variant.cleaningInstruction)
          .filter(Boolean),
      ),
    ];
  }, [item]);

  // Find the exact variant selected by the customer
  const matchedVariant = useMemo(() => {
    if (!item || !selectedSize || !selectedWeight || !selectedCleaning) {
      return null;
    }

    const [weight, weightUnit] = selectedWeight.split("-");

    return item.variants?.find(
      (variant) =>
        variant.size === selectedSize &&
        variant.weight === Number(weight) &&
        variant.weightUnit === weightUnit &&
        variant.cleaningInstruction === selectedCleaning,
    );
  }, [item, selectedSize, selectedWeight, selectedCleaning]);

  const isAvailable =
    item?.isAvailable === true && matchedVariant?.isAvailable === true;

  const handleQuantityDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = async () => {
    try {
      if (!selectedSize || !selectedWeight || !selectedCleaning) {
        toast.error("Please select size, weight and cleaning option");
        return;
      }

      if (!matchedVariant || !matchedVariant.isAvailable) {
        toast.error("This variant is unavailable");
        return;
      }

      const [weight, weightUnit] = selectedWeight.split("-");

      const response = await axios.post(
        `${serverUrl}/api/cart/add`,
        {
          itemId: item._id,
          size: selectedSize,
          weight: Number(weight),
          weightUnit,
          cleaning: selectedCleaning,
          quantity,
        },
        {
          withCredentials: true,
        },
      );

      // MongoDB succeeded → update Redux
      dispatch(setCart(response.data.cart));

      toast.success("Added to cart");
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error(
        error.response?.data?.message || "Failed to add item to cart",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FCFF]">
        <div className="text-lg font-medium text-gray-600">
          Loading product...
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FCFF] px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Product not found
        </h2>

        <p className="text-gray-500 mb-6">
          {error || "This product does not exist."}
        </p>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0088CC] text-white font-semibold"
        >
          <FaArrowLeft />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FCFF] py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#0088CC] mb-6 transition"
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Product Image */}
            <div className="bg-[#F0F9FF] p-6 sm:p-10 flex items-center justify-center">
              <div className="w-full max-w-lg aspect-square rounded-2xl overflow-hidden bg-white">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Information */}
            <div className="p-6 sm:p-10">
              {/* Category */}
              <p className="text-sm font-semibold text-[#0088CC] uppercase tracking-wide mb-2">
                {item.category}
              </p>

              {/* Name */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {item.name}
              </h1>

              {/* Description */}
              {item.description && (
                <p className="text-gray-600 leading-relaxed mb-8">
                  {item.description}
                </p>
              )}

              {/* Product unavailable */}
              {!item.isAvailable && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 font-medium">
                  This product is currently unavailable.
                </div>
              )}

              {/* SIZE */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Size</h3>

                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-5 py-3 rounded-xl border font-medium transition ${
                          selectedSize === size
                            ? "border-[#0088CC] bg-[#0088CC] text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:border-[#0088CC]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* WEIGHT */}
              {weights.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Weight</h3>

                  <div className="flex flex-wrap gap-3">
                    {weights.map((weightOption) => {
                      const value = `${weightOption.weight}-${weightOption.weightUnit}`;

                      const isSelected = selectedWeight === value;

                      return (
                        <button
                          key={value}
                          onClick={() => setSelectedWeight(value)}
                          className={`px-5 py-3 rounded-xl border font-medium transition ${
                            isSelected
                              ? "border-[#0088CC] bg-[#0088CC] text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:border-[#0088CC]"
                          }`}
                        >
                          {weightOption.weight}
                          {weightOption.weightUnit}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CLEANING */}
              <div className="flex flex-wrap gap-3">
                {cleaningOptions.length > 0 && (
                  <div className="mb-6">
                    <label className="font-semibold text-gray-900 mb-3">
                      Cleaning Instructions
                    </label>

                    <select
                      value={selectedCleaning}
                      onChange={(e) => setSelectedCleaning(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 outline-none focus:border-[#0088CC] focus:ring-2 focus:ring-[#0088CC]/20 transition"
                    >
                      <option value="">Select cleaning option</option>

                      {cleaningOptions.map((cleaning) => (
                        <option key={cleaning} value={cleaning}>
                          {cleaning}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* VARIANT RESULT */}
              <div className="mt-8">
                {!selectedSize || !selectedWeight || !selectedCleaning ? (
                  <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4">
                    <p className="text-gray-500">
                      Select size, weight and cleaning to see availability.
                    </p>
                  </div>
                ) : matchedVariant ? (
                  <div
                    className={`rounded-xl px-5 py-4 border ${
                      matchedVariant.isAvailable
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p
                          className={`font-semibold ${
                            matchedVariant.isAvailable
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {matchedVariant.isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {matchedVariant.size} • {matchedVariant.weight}
                          {matchedVariant.weightUnit} •{" "}
                          {matchedVariant.cleaningInstruction}
                        </p>
                      </div>

                      {matchedVariant.isAvailable && (
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{matchedVariant.price}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
                    <p className="font-semibold text-red-700">
                      This combination is unavailable
                    </p>

                    <p className="text-sm text-red-600 mt-1">
                      Please select a different size, weight or cleaning option.
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity */}
              {isAvailable && (
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>

                  <div className="flex items-center w-fit border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={handleQuantityDecrease}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <FaMinus className="text-sm" />
                    </button>

                    <div className="w-14 h-12 flex items-center justify-center font-semibold">
                      {quantity}
                    </div>

                    <button
                      onClick={handleQuantityIncrease}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <FaPlus className="text-sm" />
                    </button>
                  </div>
                </div>
              )}

              {/* Add To Cart */}
              <button
                disabled={!isAvailable}
                onClick={handleAddToCart}
                className={`w-full mt-8 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg transition ${
                  isAvailable
                    ? "bg-[#0088CC] text-white hover:bg-[#0077B5]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <FaShoppingCart />

                {isAvailable
                  ? `Add to Cart • ₹${matchedVariant.price * quantity}`
                  : "Unavailable"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
