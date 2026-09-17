import React, { useEffect, useMemo } from "react";
import {
  FaFish,
  FaHouse,
  FaBoxOpen,
  FaUtensils,
  FaChartLine,
  FaGear,
  FaArrowRightFromBracket,
  FaPlus,
  FaStore,
  FaMotorcycle,
  FaArrowRight,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { GiDolphin } from "react-icons/gi";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.admin);
  const { myOrders } = useSelector((state) => state.order);

  const orders = myOrders || [];

  const today = new Date();

  const todayOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!order?.createdAt) return false;

      const orderDate = new Date(order.createdAt);

      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    });
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        !["delivered", "cancelled"].includes(order?.orderStatus?.toLowerCase()),
    );
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter(
      (order) => order?.orderStatus?.toLowerCase() === "delivered",
    );
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return deliveredOrders.reduce(
      (sum, order) => sum + Number(order?.totalAmount || 0),
      0,
    );
  }, [deliveredOrders]);

  const totalItemsSold = useMemo(() => {
    return orders.reduce((sum, order) => {
      const itemCount = (order?.items || []).reduce(
        (itemSum, item) => itemSum + Number(item?.quantity || 0),
        0,
      );

      return sum + itemCount;
    }, 0);
  }, [orders]);

  const todayRevenue = useMemo(() => {
    return todayOrders
      .filter((order) => order?.orderStatus?.toLowerCase() === "delivered")
      .reduce((sum, order) => sum + Number(order?.totalAmount || 0), 0);
  }, [todayOrders]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 4)
      .map((order) => {
        const items = order?.items || [];

        const itemText =
          items.length > 0
            ? `${items[0]?.name || "Fish"} × ${
                items[0]?.quantity || 1
              }${items.length > 1 ? ` + ${items.length - 1} more` : ""}`
            : "No items";

        return {
          id: `#${order?._id?.slice(-6)?.toUpperCase() || "------"}`,
          customer:
            order?.deliveryAddress?.fullName ||
            order?.user?.fullName ||
            "Customer",
          items: itemText,
          amount: `₹${Number(order?.totalAmount || 0).toLocaleString("en-IN")}`,
          status: order?.orderStatus || "pending",
        };
      });
  }, [orders]);

  const stats = [
    {
      title: "Total Orders",
      value: orders.length.toLocaleString("en-IN"),
      change: "All time",
      icon: <FaBoxOpen />,
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      change: "Delivered",
      icon: <FaChartLine />,
    },
    {
      title: "Total Items",
      value: totalItemsSold.toLocaleString("en-IN"),
      change: "Sold",
      icon: <FaUtensils />,
    },
    {
      title: "Active Orders",
      value: activeOrders.length.toString().padStart(2, "0"),
      change: "Currently",
      icon: <FaMotorcycle />,
    },
  ];

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-600";

      case "confirmed":
        return "bg-purple-50 text-purple-600";

      case "preparing":
        return "bg-blue-50 text-blue-600";

      case "ready":
        return "bg-cyan-50 text-cyan-600";

      case "shipped":
        return "bg-indigo-50 text-indigo-600";

      case "out_for_delivery":
        return "bg-orange-50 text-orange-600";

      case "picked_up":
        return "bg-teal-50 text-teal-600";

      case "delivered":
        return "bg-green-50 text-green-600";

      case "cancelled":
        return "bg-red-50 text-red-600";

      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status
      .replaceAll("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSignOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });

      dispatch(setUserData(null));

      navigate("/signin");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    if (userData === null) {
      navigate("/signin");
    }
  }, [userData, navigate]);

  if (!myShopData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-[#F8FCFF]">
        <div className="w-full max-w-md bg-white shadow-[0_10px_40px_rgba(2,132,199,0.08)] rounded-2xl p-6 sm:p-8 border border-[#E0F2FE]">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F0F9FF] flex items-center justify-center mb-4">
              <FaFish className="text-[#0284C7] w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Add Your Fish Shop
            </h2>

            <p className="text-gray-500 mb-5 text-sm sm:text-base leading-relaxed">
              Join Fish Company and start selling your fresh seafood to
              customers around you.
            </p>

            <button
              onClick={() => navigate("/create-edit-shop")}
              className="bg-[#0284C7] text-white px-6 sm:px-7 py-2.5 rounded-xl font-semibold shadow-md shadow-[#0284C7]/20 hover:bg-[#0369A1] transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FCFF] flex">
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E0F2FE] flex-col fixed left-0 top-0 bottom-0 z-20">
        {/* Logo */}

        <div className="h-20 px-6 flex items-center border-b border-[#E0F2FE]">
          <div className="w-11 h-11 rounded-xl bg-[#F0F9FF] flex items-center justify-center">
            <GiDolphin className="text-[#0284C7] text-xl" />
          </div>

          <div className="ml-3">
            <h1 className="font-bold text-gray-900">Fish Company</h1>

            <p className="text-[10px] text-[#0284C7]">OWNER PANEL</p>
          </div>
        </div>

        {/* Navigation */}

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Main Menu
          </p>

          <div className="space-y-1">
            {/* Dashboard */}

            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[#F0F9FF] text-[#0369A1] font-semibold text-sm"
            >
              <FaHouse className="text-sm" />
              Dashboard
            </button>

            {/* Orders */}

            <button
              onClick={() => navigate("/owner-orders")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#0369A1] transition text-sm"
            >
              <FaBoxOpen className="text-sm" />
              Orders
              <span className="ml-auto bg-[#0284C7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeOrders.length}
              </span>
            </button>

            {/* Fishes */}

            <button
              onClick={() => navigate("/manage-items")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#0369A1] transition text-sm"
            >
              <FaFish className="text-sm" />
              Fishes
            </button>

            {/* Analytics */}

            <button
              onClick={() => navigate("/complete-analytics")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#0369A1] transition text-sm"
            >
              <FaChartLine className="text-sm" />
              Analytics
            </button>
          </div>

          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mt-8 mb-3">
            Management
          </p>

          <div className="space-y-1">
            {/* Shop */}

            <button
              onClick={() => navigate("/manage-shop")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[#F0F9FF] text-[#0369A1] font-semibold text-sm"
            >
              <FaStore className="text-sm" />
              My Shop
            </button>

            {/* Settings */}

            <button
              onClick={() => navigate("/manage-shop")}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#0369A1] transition text-sm"
            >
              <FaGear className="text-sm" />
              Shop Settings
            </button>
          </div>
        </nav>

        {/* User */}

        <div className="p-4 border-t border-[#E0F2FE]">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold">
              {userData?.fullName?.charAt(0)?.toUpperCase() || "O"}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {userData?.fullName || "Shop Owner"}
              </p>

              <p className="text-[11px] text-gray-400 truncate">
                {userData?.email || "owner@example.com"}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition text-sm"
          >
            <FaArrowRightFromBracket />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        {/* Header */}

        <header className="h-20 bg-white border-b border-[#E0F2FE] px-5 sm:px-8 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">
              {today.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome,{" "}
              <span className="text-[#0284C7]">
                {userData?.fullName?.split(" ")[0] || "Owner"}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/add-item")}
              className="hidden sm:flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-[#0284C7]/20"
            >
              <FaPlus />
              Add Fish
            </button>

            <div className="w-10 h-10 rounded-full bg-[#F0F9FF] flex items-center justify-center text-[#0284C7] font-bold">
              {userData?.fullName?.charAt(0)?.toUpperCase() || "O"}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <div className="p-5 sm:p-8">
          <div className="bg-[#0369A1] rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden">
            <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-white/5" />

            <div className="absolute right-20 -bottom-32 w-72 h-72 rounded-full bg-white/5" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GiDolphin className="text-[#7DD3FC] text-xl" />

                  <span className="text-sm text-[#BAE6FD]">Your Fish Shop</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold">
                  {myShopData?.name || "Your Shop"}
                </h1>

                <p className="text-sm text-[#BAE6FD] mt-2">
                  Manage your fishes, orders and shop from one place.
                </p>
              </div>

              <button
                onClick={() => navigate("/manage-shop")}
                className="w-fit flex items-center gap-2 bg-white text-[#0369A1] px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#F0F9FF] transition"
              >
                Manage Shop
                <FaArrowRight />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-white border border-[#E0F2FE] rounded-2xl p-5 hover:shadow-md hover:shadow-[#0284C7]/5 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center text-[#0284C7]">
                    {stat.icon}
                  </div>

                  <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-4">{stat.title}</p>

                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            <div className="xl:col-span-2 bg-white border border-[#E0F2FE] rounded-2xl">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Recent Orders</h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Latest orders from your shop
                  </p>
                </div>

                <button
                  onClick={() => navigate("/owner-orders")}
                  className="text-xs font-semibold text-[#0284C7] hover:text-[#0369A1]"
                >
                  View all
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 p-5 transition hover:bg-[#F8FCFF]"
                    >
                      <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0F9FF] text-[#0284C7] sm:flex">
                        <FaFish />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-gray-800">
                            {order.id}
                          </p>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getStatusStyle(
                              order.status,
                            )}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          {order.customer}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {order.items}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-gray-800">
                          {order.amount}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center">
                    <FaBoxOpen className="mx-auto text-3xl text-gray-300" />

                    <p className="mt-3 text-sm font-semibold text-gray-600">
                      No orders yet
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      New orders will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#E0F2FE] rounded-2xl p-5">
              <h3 className="font-bold text-gray-900">Quick Actions</h3>

              <p className="text-xs text-gray-400 mt-1 mb-5">
                Manage your fish shop quickly
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/add-item")}
                  className="w-full p-4 rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] transition flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0284C7] text-white flex items-center justify-center">
                    <FaPlus />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Add Fish
                    </p>

                    <p className="text-[11px] text-gray-400">
                      Add a new fish to your shop
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/owner-orders")}
                  className="w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white text-[#0284C7] border border-gray-100 flex items-center justify-center">
                    <FaBoxOpen />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Manage Orders
                    </p>

                    <p className="text-[11px] text-gray-400">
                      {activeOrders.length} active orders
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/complete-analytics")}
                  className="w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white text-[#0284C7] border border-gray-100 flex items-center justify-center">
                    <FaChartLine />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Sales Analytics
                    </p>

                    <p className="text-[11px] text-gray-400">
                      View sales and business performance
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/manage-shop")}
                  className="w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white text-[#0284C7] border border-gray-100 flex items-center justify-center">
                    <FaStore />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Shop Settings
                    </p>

                    <p className="text-[11px] text-gray-400">
                      Update your shop details
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white border border-[#E0F2FE] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">Today's Overview</h3>

                <p className="text-xs text-gray-400 mt-1">
                  Your shop's performance today
                </p>
              </div>

              <GiDolphin className="text-[#0284C7] text-xl" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FCFF]">
                <p className="text-xs text-gray-400">Orders</p>

                <p className="text-xl font-bold text-gray-900 mt-1">
                  {todayOrders.length}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FCFF]">
                <p className="text-xs text-gray-400">Revenue</p>

                <p className="text-xl font-bold text-gray-900 mt-1">
                  ₹{todayRevenue.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FCFF]">
                <p className="text-xs text-gray-400">Delivered</p>

                <p className="text-xl font-bold text-green-600 mt-1">
                  {
                    todayOrders.filter(
                      (order) =>
                        order?.orderStatus?.toLowerCase() === "delivered",
                    ).length
                  }
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FCFF]">
                <p className="text-xs text-gray-400">Pending</p>

                <p className="text-xl font-bold text-amber-500 mt-1">
                  {
                    todayOrders.filter(
                      (order) =>
                        !["delivered", "cancelled"].includes(
                          order?.orderStatus?.toLowerCase(),
                        ),
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
