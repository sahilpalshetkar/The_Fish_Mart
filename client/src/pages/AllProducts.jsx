import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaMagnifyingGlass,
  FaSliders,
  FaXmark,
  FaChevronDown,
  FaCartShopping,
  FaFish,
  FaArrowLeft,
} from "react-icons/fa6";
import { serverUrl } from "../App";

const categories = [
  "All",
  "Fish",
  "Prawns",
  "Crabs",
  "Lobsters",
  "Shellfish",
  "Dried Fish",
  "Fish Eggs",
];

const AllProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Read category from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");

    if (category && categories.includes(category)) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("All");
    }
  }, [location.search]);

  // Fetch products
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
        setProducts(response?.data?.items);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter + Search + Sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query),
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.variants?.[0]?.price || 0) -
          Number(b.variants?.[0]?.price || 0),
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.variants?.[0]?.price || 0) -
          Number(a.variants?.[0]?.price || 0),
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, search, sortBy]);

  const handleCategory = (category) => {
    setSelectedCategory(category);

    if (category === "All") {
      navigate("/all-products");
    } else {
      navigate(`/all-products?category=${encodeURIComponent(category)}`);
    }

    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearch("");
    setSortBy("default");
    navigate("/all-products");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 md:py-8">
          <div className="max-w-2xl">
            <p className="text-[#0369A1] text-sm font-semibold uppercase tracking-wider justify-center flex md:block mb-4">
              Fresh Seafood
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="w-10 h-10 flex items-center justify-center rounded-full
               bg-slate-100 text-slate-600
               hover:bg-[#0369A1] hover:text-white
               transition-all duration-200"
              >
                <FaArrowLeft className="text-sm" />
              </button>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex justify-center">
                All Products
              </h1>
            </div>
            <p className="mt-3 text-slate-500 leading-relaxed">
              Fresh fish and premium seafood, carefully selected and delivered
              fresh to your doorstep.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 relative max-w-2xl">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search fish, prawns, crabs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-13 pl-11 pr-11 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] transition"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <FaXmark />
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* Mobile toolbar */}
        <div className="flex lg:hidden items-center justify-between mb-5">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700"
          >
            <FaSliders />
            Filters
          </button>

          <p className="text-sm text-slate-500">
            {filteredProducts.length} products
          </p>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-900">Categories</h2>

                <FaFish className="text-[#0369A1]" />
              </div>

              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategory(category)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${
                      selectedCategory === category
                        ? "bg-[#E0F2FE] text-[#0369A1] font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{category}</span>

                    {selectedCategory === category && (
                      <span className="w-2 h-2 rounded-full bg-[#0369A1]" />
                    )}
                  </button>
                ))}
              </div>

              {(search || sortBy !== "default") && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-5 pt-4 border-t border-slate-100 text-sm font-semibold text-red-500 hover:text-red-600"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          <section>
            {/* Top toolbar */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedCategory === "All"
                    ? "All Seafood"
                    : selectedCategory}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {filteredProducts.length} products found
                </p>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 outline-none cursor-pointer"
                >
                  <option value="default">Default</option>

                  <option value="price-low">Price: Low to High</option>

                  <option value="price-high">Price: High to Low</option>

                  <option value="name">Name</option>
                </select>

                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Mobile sort */}
            <div className="lg:hidden flex justify-end mb-5">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm text-slate-700 outline-none"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>

                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-2xl overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-slate-200" />

                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-5 bg-slate-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-slate-100 py-20 px-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0369A1] text-2xl">
                  <FaFish />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  No products found
                </h3>

                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                  We couldn't find any seafood matching your search or selected
                  category.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-3 bg-[#0369A1] hover:bg-[#075985] text-white rounded-xl text-sm font-semibold transition"
                >
                  View All Products
                </button>
              </div>
            ) : (
              /* Product grid */
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="relative h-44 sm:h-52 md:h-56 overflow-hidden cursor-pointer bg-slate-100"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Category */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur rounded-lg text-[11px] font-semibold text-[#0369A1]">
                        {product.category}
                      </span>

                      {/* Availability */}
                      {!product.isAvailable && (
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <span className="bg-white/80 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-500">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="font-bold text-slate-900 truncate cursor-pointer hover:text-[#0369A1] transition"
                      >
                        {product.name}
                      </h3>

                      <p className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-2 min-h-8">
                        {product.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-lg font-bold text-[#0369A1]">
                            ₹{product.variants[0]?.price}
                          </span>

                          <span className="text-xs text-slate-400 ml-1">
                            / kg
                          </span>
                        </div>

                        <button
                          disabled={product.isAvailable === false}
                          onClick={() => navigate(`/product/${product._id}`)}
                          className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center hover:bg-[#0369A1] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <FaCartShopping className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AllProducts;
