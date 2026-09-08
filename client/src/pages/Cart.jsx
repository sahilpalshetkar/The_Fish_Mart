import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaMinus,
  FaPlus,
  FaTrash,
  FaFish,
  FaArrowRight,
  FaBagShopping,
  FaShieldHeart,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { serverUrl } from "../App";
import { setCart } from "../redux/cartSlice";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, totalAmount } = useSelector((state) => state.cart);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${serverUrl}/api/cart/get`, {
          withCredentials: true,
        });

        dispatch(setCart(response.data));
      } catch (error) {
        console.error("Get cart error:", error);

        if (error.response?.status !== 401) {
          toast.error(error.response?.data?.message || "Failed to load cart");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [dispatch]);

  const increaseQuantityHandler = async (item) => {
    try {
      setUpdatingId(item.cartItemId);

      const response = await axios.put(
        `${serverUrl}/api/cart/quantity`,
        {
          cartItemId: item.cartItemId,
          quantity: item.quantity + 1,
        },
        {
          withCredentials: true,
        },
      );

      // MongoDB succeeded
      dispatch(setCart(response.data.cart));
    } catch (error) {
      console.error("Increase quantity error:", error);

      toast.error(
        error.response?.data?.message || "Failed to increase quantity",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const decreaseQuantityHandler = async (item) => {
    if (item.quantity <= 1) {
      await removeItem(item);
      return;
    }

    try {
      setUpdatingId(item.cartItemId);

      const response = await axios.put(
        `${serverUrl}/api/cart/quantity`,
        {
          cartItemId: item.cartItemId,
          quantity: item.quantity - 1,
        },
        {
          withCredentials: true,
        },
      );

      // MongoDB succeeded
      dispatch(setCart(response.data.cart));
    } catch (error) {
      console.error("Decrease quantity error:", error);

      toast.error(
        error.response?.data?.message || "Failed to decrease quantity",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (item) => {
    try {
      setUpdatingId(item.cartItemId);

      const response = await axios.delete(
        `${serverUrl}/api/cart/remove/${item.cartItemId}`,
        {
          withCredentials: true,
        },
      );

      // MongoDB succeeded
      dispatch(setCart(response.data.cart));

      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Remove cart item error:", error);

      toast.error(error.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="text-lg font-medium text-slate-500">
          Loading cart...
        </div>
      </div>
    );
  }

  // Empty Cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-6 py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
            <FaBagShopping className="text-4xl" />
          </div>

          <h1 className="mt-7 text-3xl font-bold text-slate-900">
            Your cart is empty
          </h1>

          <p className="mt-3 max-w-md text-slate-500">
            Looks like you haven't added any seafood yet. Explore our fresh fish
            and prawns and find something delicious.
          </p>

          <button
            onClick={() => navigate("/all-products")}
            className="mt-8 flex items-center gap-3 rounded-xl bg-cyan-600 px-7 py-3.5 font-semibold text-white transition hover:bg-cyan-700"
          >
            Browse Seafood
            <FaArrowRight />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-cyan-600"
          >
            <FaArrowLeft />
            Continue Shopping
          </button>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Your Cart
              </h1>

              <p className="mt-2 text-slate-500">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in your cart
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*  CART CONTENT */}
      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ITEMS */}
          <div className="space-y-4">
            {cartItems?.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/product/${item.item}`)}
                className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Image */}
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-36">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl text-slate-300">
                        <FaFish />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h2 className="line-clamp-2 font-bold text-slate-900 sm:text-lg">
                          {item.name}
                        </h2>

                        {item.category && (
                          <p className="mt-1 text-xs font-medium text-cyan-600">
                            {item.category}
                          </p>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item);
                        }}
                        disabled={updatingId === item.cartItemId}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Remove ${item.name}`}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>

                    {/* Variant */}
                    {item.variant && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        {item.variant.size && (
                          <span>
                            Size:{" "}
                            <span className="font-medium text-slate-700">
                              {item.variant.size}
                            </span>
                          </span>
                        )}

                        {item.variant.weight && (
                          <span>
                            Weight:{" "}
                            <span className="font-medium text-slate-700">
                              {item.variant.weight}
                              {item.variant.weightUnit}
                            </span>
                          </span>
                        )}

                        {item.variant.cleaningInstruction && (
                          <span>
                            Cleaning:{" "}
                            <span className="font-medium text-slate-700">
                              {item.variant.cleaningInstruction}
                            </span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
                      {/* Price */}
                      <div>
                        <p className="text-xs text-slate-400">Price</p>

                        <p className="mt-0.5 text-lg font-bold text-slate-900">
                          ₹{item.price}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center rounded-xl border border-slate-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            decreaseQuantityHandler(item);
                          }}
                          disabled={updatingId === item.cartItemId}
                          className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaMinus className="text-xs" />
                        </button>

                        <span className="flex h-9 min-w-9 items-center justify-center border-x border-slate-200 px-2 text-sm font-semibold text-slate-900">
                          {item.quantity}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            increaseQuantityHandler(item);
                          }}
                          disabled={updatingId === item.cartItemId}
                          className="flex h-9 w-9 items-center justify-center text-slate-500 transition hover:bg-slate-50 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total</p>

                        <p className="mt-0.5 text-lg font-bold text-cyan-600">
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <button
              onClick={() => navigate("/products")}
              className="mt-3 flex items-center gap-2 text-sm font-semibold text-cyan-600 transition hover:text-cyan-700"
            >
              <FaArrowLeft />
              Continue Shopping
            </button>
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>

                  <span className="font-medium text-slate-900">
                    ₹{Number(totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery</span>

                  <span className="font-medium text-green-600">Free</span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Total</span>

                    <span className="text-2xl font-bold text-cyan-600">
                      ₹{Number(totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout */}
              <button
                onClick={() => navigate("/checkout")}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-cyan-600 px-6 py-4 font-semibold text-white transition hover:bg-cyan-700"
              >
                Proceed to Checkout
                <FaArrowRight />
              </button>

              {/* Trust */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                    <FaShieldHeart />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Freshness Guaranteed
                    </p>

                    <p className="text-xs text-slate-400">
                      Quality seafood delivered fresh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Cart;
