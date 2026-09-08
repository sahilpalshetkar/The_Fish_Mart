import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaFish,
  FaImage,
  FaPlus,
  FaTrash,
  FaCheck,
} from "react-icons/fa6";
import { ClipLoader } from "react-spinners";
import { serverUrl } from "../App";

const categories = [
  "Fish",
  "Prawns",
  "Crabs",
  "Lobsters",
  "Shellfish",
  "Dried Fish",
  "Fish Eggs",
];

const EditItem = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  const [variants, setVariants] = useState([]);

  const [itemAvailable, setItemAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // FETCH ITEM
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

        const item = response.data.item || response.data;

        setName(item.name || "");
        setDescription(item.description || "");
        setCategory(item.category || "");

        setFrontendImage(item.image || null);

        setItemAvailable(
          item.isAvailable === undefined ? true : item.isAvailable,
        );

        setVariants(
          item.variants?.length > 0
            ? item.variants.map((variant) => ({
                _id: variant._id,
                size: variant.size || "",
                weight: variant.weight ?? "",
                weightUnit: variant.weightUnit || "kg",
                cleaningInstruction: variant.cleaningInstruction || "",
                price: variant.price ?? "",
                isAvailable:
                  variant.isAvailable === undefined
                    ? true
                    : variant.isAvailable,
              }))
            : [
                {
                  size: "",
                  weight: "",
                  weightUnit: "kg",
                  cleaningInstruction: "",
                  price: "",
                  isAvailable: true,
                },
              ],
        );
      } catch (error) {
        console.error("Fetch Item Error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load item. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  // IMAGE
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      return;
    }

    setError("");

    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  // VARIANT
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: "",
        weight: "",
        weightUnit: "kg",
        cleaningInstruction: "",
        price: "",
        isAvailable: true,
      },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      return;
    }

    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleVariantAvailability = (index) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? {
              ...variant,
              isAvailable: !variant.isAvailable,
            }
          : variant,
      ),
    );
  };

  // ITEM AVAILABILITY
  const toggleItemAvailability = () => {
    setItemAvailable((prev) => !prev);
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // BASIC VALIDATION
    if (!name.trim()) {
      setError("Please enter the fish name.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!frontendImage) {
      setError("Please upload an item image.");
      return;
    }

    if (variants.length === 0) {
      setError("Please add at least one variant.");
      return;
    }

    // VARIANT VALIDATION
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];

      if (!variant.size.trim()) {
        setError(`Please enter size for variant ${i + 1}.`);
        return;
      }

      if (!variant.weight || Number(variant.weight) <= 0) {
        setError(`Please enter a valid weight for variant ${i + 1}.`);
        return;
      }

      if (!variant.price || Number(variant.price) < 0) {
        setError(`Please enter a valid price for variant ${i + 1}.`);
        return;
      }
    }

    try {
      setUpdating(true);

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("isAvailable", itemAvailable);

      // Only send image if user selected a new image
      if (backendImage) {
        formData.append("image", backendImage);
      }

      // Send variants as JSON
      formData.append(
        "variants",
        JSON.stringify(
          variants.map((variant) => ({
            ...(variant._id && {
              _id: variant._id,
            }),
            size: variant.size.trim(),
            weight: Number(variant.weight),
            weightUnit: variant.weightUnit,
            cleaningInstruction: variant.cleaningInstruction?.trim() || "",
            price: Number(variant.price),
            isAvailable: variant.isAvailable,
          })),
        ),
      );

      const response = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log(response.data);

      navigate("/manage-items");
    } catch (error) {
      console.error("Update Item Error:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to update item. Please try again.",
      );
    } finally {
      setUpdating(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <ClipLoader size={35} color="#0284C7" />

          <p className="text-sm text-gray-500">Loading item...</p>
        </div>
      </div>
    );
  }

  // UI
  return (
    <div className="min-h-screen bg-[#F8FCFF]">
      <header className="h-18 sm:h-20 bg-white border-b border-[#E0F2FE] flex items-center px-4 sm:px-8">
        <button
          type="button"
          onClick={() => navigate("/manage-items")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#0284C7] transition"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
            <FaArrowLeft className="text-[#0284C7] text-sm" />
          </div>

          <span className="hidden sm:block text-sm font-medium">Back</span>
        </button>

        <div className="mx-auto flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
            <FaFish className="text-[#0284C7]" />
          </div>

          <span className="font-bold text-gray-900">Fish Company</span>
        </div>

        <div className="w-16 sm:w-20" />
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Heading */}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#F0F9FF] text-[#0284C7] px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
            <FaFish />
            EDIT ITEM
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Edit fish
          </h1>

          <p className="text-gray-500 text-sm sm:text-base mt-3">
            Update your seafood product and its available variants.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-[#E0F2FE] shadow-[0_15px_50px_rgba(2,132,199,0.07)] overflow-hidden"
        >
          {/* Error */}

          {error && (
            <div className="mx-6 sm:mx-10 mt-6 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="p-6 sm:p-10 space-y-10">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Product Image
              </h2>

              <p className="text-xs text-gray-400 mb-4">
                Upload a new image if you want to replace the current one.
              </p>

              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />

                <div className="w-full max-w-md aspect-video rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden hover:border-[#0284C7] transition">
                  {frontendImage ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={frontendImage}
                        alt="Item preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />

                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="bg-white px-4 py-2 rounded-lg text-sm font-semibold">
                          Change Image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-14 h-14 rounded-xl bg-[#F0F9FF] flex items-center justify-center mb-3">
                        <FaImage className="text-[#0284C7] text-xl" />
                      </div>

                      <p className="font-semibold text-gray-700">
                        Upload item image
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG or WEBP · Max 5MB
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fish Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Surmai"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:bg-white focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10"
                  />
                </div>

                {/* Category */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:bg-white focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10"
                  >
                    <option value="">Select category</option>

                    {categories.map((itemCategory) => (
                      <option key={itemCategory} value={itemCategory}>
                        {itemCategory}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}

              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the fish, freshness, origin, etc."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none resize-none focus:bg-white focus:border-[#0284C7] focus:ring-4 focus:ring-[#0284C7]/10"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Item Availability
              </h2>

              <p className="text-xs text-gray-400 mb-4">
                Control whether this fish is available to customers.
              </p>

              <button
                type="button"
                onClick={toggleItemAvailability}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  itemAvailable
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <FaCheck />

                {itemAvailable ? "Item Available" : "Item Unavailable"}
              </button>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Variants</h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Add different weights, sizes and prices.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0F9FF] text-[#0284C7] text-sm font-semibold hover:bg-[#E0F2FE] transition"
                >
                  <FaPlus className="text-xs" />
                  Add Variant
                </button>
              </div>

              <div className="space-y-5">
                {variants.map((variant, index) => (
                  <div
                    key={variant._id || index}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                  >
                    {/* Variant Header */}

                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-gray-800">
                        Variant {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={variants.length === 1}
                        className="text-red-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed transition"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {/* Size + Weight + Unit + Price */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Size */}

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Size
                        </label>

                        <input
                          type="text"
                          value={variant.size}
                          onChange={(e) =>
                            handleVariantChange(index, "size", e.target.value)
                          }
                          placeholder="Small"
                          className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#0284C7]"
                        />
                      </div>

                      {/* Weight */}

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Weight
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.weight}
                          onChange={(e) =>
                            handleVariantChange(index, "weight", e.target.value)
                          }
                          placeholder="1"
                          className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#0284C7]"
                        />
                      </div>

                      {/* Unit */}

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Unit
                        </label>

                        <select
                          value={variant.weightUnit}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "weightUnit",
                              e.target.value,
                            )
                          }
                          className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#0284C7]"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                        </select>
                      </div>

                      {/* Price */}

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          Price (₹)
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(index, "price", e.target.value)
                          }
                          placeholder="850"
                          className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#0284C7]"
                        />
                      </div>
                    </div>

                    {/* Cleaning Instruction */}

                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        Cleaning Instruction
                      </label>

                      <input
                        type="text"
                        value={variant.cleaningInstruction}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "cleaningInstruction",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Cleaned and cut into pieces"
                        className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#0284C7]"
                      />
                    </div>

                    {/* Availability */}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">
                        Variant Availability
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleVariantAvailability(index)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                          variant.isAvailable
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <FaCheck />

                        {variant.isAvailable ? "Available" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={updating}
                className="w-full h-13 bg-[#0284C7] hover:bg-[#0369A1] disabled:bg-[#BAE6FD] text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <ClipLoader size={19} color="white" />
                    Updating Item...
                  </>
                ) : (
                  <>
                    Update Fish
                    <FaArrowLeft className="rotate-180 text-xs" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditItem;
