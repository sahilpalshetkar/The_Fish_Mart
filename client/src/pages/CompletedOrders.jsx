import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Filter,
  IndianRupee,
  Package,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { serverUrl } from "../App";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const categories = [
  "All Categories",
  "Fish",
  "Prawns",
  "Crabs",
  "Lobsters",
  "Shellfish",
  "Dried Fish",
  "Fish Eggs",
];

const paymentMethods = ["All Payments", "COD", "ONLINE"];

const formatAmount = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOrderArea = (order) => {
  return order?.deliveryAddress?.city || "Unknown";
};

const getPaymentMethod = (order) => {
  return String(order?.paymentMethod || "COD").toUpperCase();
};

const getItemQuantity = (order) => {
  return (
    order?.items?.reduce(
      (total, item) => total + Number(item?.quantity || 0),
      0,
    ) || 0
  );
};

const getProductNames = (order) => {
  if (!order?.items?.length) return "No items";

  if (order.items.length === 1) {
    return order.items[0]?.name || "Product";
  }

  return `${order.items[0]?.name || "Product"} + ${
    order.items.length - 1
  } more`;
};

const getProductCategory = (order) => {
  return order?.items?.[0]?.category || "Other";
};

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-green-50 text-green-700";

    case "cancelled":
      return "bg-red-50 text-red-700";

    case "confirmed":
      return "bg-purple-50 text-purple-700";

    case "preparing":
      return "bg-blue-50 text-blue-700";

    case "out_for_delivery":
    case "out of delivery":
      return "bg-orange-50 text-orange-700";

    default:
      return "bg-gray-50 text-gray-700";
  }
};

export default function CompletedOrders() {
  /*
    ========================================
    ORDERS
    ========================================
  */

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  /*
    ========================================
    ANALYTICS
    ========================================
  */

  const [salesAnalytics, setSalesAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalSubtotal: 0,
    totalDeliveryFees: 0,
    averageOrderValue: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [areaData, setAreaData] = useState([]);

  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  /*
    ========================================
    FILTERS
    ========================================
  */

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );

  const [selectedMonth, setSelectedMonth] = useState("All Months");

  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const [selectedPayment, setSelectedPayment] = useState("All Payments");

  const [selectedArea, setSelectedArea] = useState("All Areas");

  const [selectedValue, setSelectedValue] = useState("All Orders");

  const [sortBy, setSortBy] = useState("newest");

  const [showFilters, setShowFilters] = useState(true);

  /*
    ========================================
    FETCH COMPLETED ORDERS
    ========================================
  */

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);

      const response = await axios.get(
        `${serverUrl}/api/order/complete-analytics`,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Fetch completed orders error:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);

      const params = new URLSearchParams();

      params.append("year", selectedYear);

      if (selectedMonth !== "All Months") {
        params.append("month", months.indexOf(selectedMonth) + 1);
      }

      if (selectedCategory !== "All Categories") {
        params.append("category", selectedCategory);
      }

      if (selectedPayment !== "All Payments") {
        params.append("paymentMethod", selectedPayment);
      }

      if (selectedArea !== "All Areas") {
        params.append("city", selectedArea);
      }

      const query = params.toString();

      const [
        salesResponse,
        monthlyResponse,
        productsResponse,
        categoriesResponse,
        paymentsResponse,
        areasResponse,
      ] = await Promise.all([
        axios.get(`${serverUrl}/api/analytics/sales?${query}`, {
          withCredentials: true,
        }),

        axios.get(`${serverUrl}/api/analytics/monthly?year=${selectedYear}`, {
          withCredentials: true,
        }),

        axios.get(`${serverUrl}/api/analytics/products?${query}`, {
          withCredentials: true,
        }),

        axios.get(`${serverUrl}/api/analytics/categories?${query}`, {
          withCredentials: true,
        }),

        axios.get(`${serverUrl}/api/analytics/payments?${query}`, {
          withCredentials: true,
        }),

        axios.get(`${serverUrl}/api/analytics/areas?${query}`, {
          withCredentials: true,
        }),
      ]);

      if (salesResponse.data.success) {
        setSalesAnalytics(salesResponse.data.analytics || {});
      }

      if (monthlyResponse.data.success) {
        setMonthlyData(monthlyResponse.data.data || []);
      }

      if (productsResponse.data.success) {
        setTopProducts(productsResponse.data.data || []);
      }

      if (categoriesResponse.data.success) {
        setCategoryData(categoriesResponse.data.data || []);
      }

      if (paymentsResponse.data.success) {
        setPaymentData(paymentsResponse.data.data || []);
      }

      if (areasResponse.data.success) {
        setAreaData(areasResponse.data.data || []);
      }
    } catch (error) {
      console.error("Fetch analytics error:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  /*
    ========================================
    INITIAL LOAD
    ========================================
  */

  useEffect(() => {
    fetchOrders();
  }, []);

  /*
    ========================================
    ANALYTICS FILTER CHANGE
    ========================================
  */

  useEffect(() => {
    fetchAnalytics();
  }, [
    selectedYear,
    selectedMonth,
    selectedCategory,
    selectedPayment,
    selectedArea,
  ]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const orderYears = orders
      .map((order) => new Date(order.createdAt).getFullYear())
      .filter(Boolean);

    return [...new Set([currentYear, ...orderYears])].sort((a, b) => b - a);
  }, [orders]);

  /*
    ========================================
    FILTER ORDERS FOR TABLE
    ========================================
  */

  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => order?.orderStatus === "delivered");

    result = result.filter((order) => {
      const date = new Date(order.createdAt);

      if (date.getFullYear() !== Number(selectedYear)) {
        return false;
      }

      if (
        selectedMonth !== "All Months" &&
        date.getMonth() !== months.indexOf(selectedMonth)
      ) {
        return false;
      }

      if (
        selectedCategory !== "All Categories" &&
        !order.items?.some(
          (item) =>
            item?.category?.toLowerCase() === selectedCategory.toLowerCase(),
        )
      ) {
        return false;
      }

      if (
        selectedPayment !== "All Payments" &&
        getPaymentMethod(order) !== selectedPayment
      ) {
        return false;
      }

      if (
        selectedArea !== "All Areas" &&
        getOrderArea(order).toLowerCase() !== selectedArea.toLowerCase()
      ) {
        return false;
      }

      const amount = Number(order.totalAmount || 0);

      if (selectedValue === "Under ₹500" && amount >= 500) {
        return false;
      }

      if (
        selectedValue === "₹500 - ₹1,000" &&
        (amount < 500 || amount > 1000)
      ) {
        return false;
      }

      if (
        selectedValue === "₹1,000 - ₹2,000" &&
        (amount < 1000 || amount > 2000)
      ) {
        return false;
      }

      if (selectedValue === "₹2,000+" && amount < 2000) {
        return false;
      }

      return true;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "highest") {
        return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
      }

      if (sortBy === "lowest") {
        return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
      }

      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [
    orders,
    selectedYear,
    selectedMonth,
    selectedCategory,
    selectedPayment,
    selectedArea,
    selectedValue,
    sortBy,
  ]);

  /*
    ========================================
    PAYMENT SUMMARY
    ========================================
  */

  const codData =
    paymentData.find((item) => item.paymentMethod === "COD") || {};

  const onlineData =
    paymentData.find((item) => item.paymentMethod === "ONLINE") || {};

  const codOrders = Number(codData.orders || 0);

  const onlineOrders = Number(onlineData.orders || 0);

  const totalOrders = Number(salesAnalytics.totalOrders || 0);

  const totalRevenue = Number(salesAnalytics.totalRevenue || 0);

  const totalItems = filteredOrders.reduce(
    (total, order) => total + getItemQuantity(order),
    0,
  );

  const codPercentage = totalOrders > 0 ? (codOrders / totalOrders) * 100 : 0;

  const onlinePercentage =
    totalOrders > 0 ? (onlineOrders / totalOrders) * 100 : 0;

  /*
    ========================================
    CUSTOMER ANALYTICS
    ========================================
    
    This is currently calculated from the
    completed orders returned for the table.

    Later this can also become a MongoDB
    aggregation endpoint.
  */

  const uniqueCustomers = useMemo(() => {
    const customers = new Set();

    filteredOrders.forEach((order) => {
      const customerId = order?.user?._id || order?.user;

      if (customerId) {
        customers.add(String(customerId));
      }
    });

    return customers.size;
  }, [filteredOrders]);

  const repeatCustomers = useMemo(() => {
    const customerOrders = {};

    filteredOrders.forEach((order) => {
      const customerId = order?.user?._id || order?.user;

      if (!customerId) return;

      const key = String(customerId);

      customerOrders[key] = (customerOrders[key] || 0) + 1;
    });

    return Object.values(customerOrders).filter((count) => count > 1).length;
  }, [filteredOrders]);

  const repeatRate =
    uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

  /*
    ========================================
    CLEAR FILTERS
    ========================================
  */

  const clearFilters = () => {
    setSelectedYear(new Date().getFullYear().toString());

    setSelectedMonth("All Months");
    setSelectedCategory("All Categories");
    setSelectedPayment("All Payments");
    setSelectedArea("All Areas");
    setSelectedValue("All Orders");
    setSortBy("newest");
  };

  const hasActiveFilters =
    selectedMonth !== "All Months" ||
    selectedCategory !== "All Categories" ||
    selectedPayment !== "All Payments" ||
    selectedArea !== "All Areas" ||
    selectedValue !== "All Orders";

  /*
    ========================================
    LOADING
    ========================================
  */

  const isLoading = loadingOrders || loadingAnalytics;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-sky-600">
              BUSINESS INTELLIGENCE
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Sales Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor revenue, orders, customers, products and delivery
              performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Filter size={17} />
              Filters
              {showFilters ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            <button
              onClick={() => {
                fetchOrders();
                fetchAnalytics();
              }}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
              title="Refresh"
            >
              <RotateCcw
                size={17}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* FILTERS */}

        {showFilters && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Analytics Filters
                </h2>

                <p className="text-xs text-slate-500">
                  Change filters to update the analytics automatically.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600"
                >
                  <X size={15} />
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <FilterSelect
                label="Year"
                icon={<CalendarDays size={16} />}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={years.map(String)}
              />

              <FilterSelect
                label="Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={["All Months", ...months]}
              />

              <FilterSelect
                label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categories}
              />

              <FilterSelect
                label="Payment"
                icon={<CreditCard size={16} />}
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                options={paymentMethods}
              />

              <FilterSelect
                label="Area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                options={["All Areas", ...areaData.map((item) => item.city)]}
              />

              <FilterSelect
                label="Order Value"
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                options={[
                  "All Orders",
                  "Under ₹500",
                  "₹500 - ₹1,000",
                  "₹1,000 - ₹2,000",
                  "₹2,000+",
                ]}
              />

              <FilterSelect
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={["newest", "oldest", "highest", "lowest"]}
                displayOptions={{
                  newest: "Newest First",
                  oldest: "Oldest First",
                  highest: "Highest Amount",
                  lowest: "Lowest Amount",
                }}
              />
            </div>
          </div>
        )}

        {/* KPI CARDS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total Revenue"
            value={formatAmount(totalRevenue)}
            subtitle={`${selectedYear} delivered sales`}
            icon={<IndianRupee size={21} />}
          />

          <KpiCard
            title="Total Orders"
            value={totalOrders.toLocaleString("en-IN")}
            subtitle={`${totalItems.toLocaleString("en-IN")} items sold`}
            icon={<ShoppingBag size={21} />}
          />

          <KpiCard
            title="Average Order Value"
            value={formatAmount(salesAnalytics.averageOrderValue)}
            subtitle="Revenue per order"
            icon={<TrendingUp size={21} />}
          />

          <KpiCard
            title="Customers"
            value={uniqueCustomers.toLocaleString("en-IN")}
            subtitle={`${repeatRate.toFixed(1)}% repeat customers`}
            icon={<Users size={21} />}
          />
        </div>

        {/* SECONDARY METRICS */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SmallMetric
            title="COD Orders"
            value={`${codPercentage.toFixed(1)}%`}
            subtitle={`${codOrders} orders`}
          />

          <SmallMetric
            title="Online Orders"
            value={`${onlinePercentage.toFixed(1)}%`}
            subtitle={`${onlineOrders} orders`}
          />

          <SmallMetric
            title="Delivery Fees"
            value={formatAmount(salesAnalytics.totalDeliveryFees)}
            subtitle="Collected delivery fees"
          />
        </div>

        {/* REVENUE TREND */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Revenue Trend</h2>

              <p className="text-sm text-slate-500">
                Monthly performance for {selectedYear}
              </p>
            </div>

            <div className="rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700">
              {formatAmount(totalRevenue)} total
            </div>
          </div>

          <div className="flex h-64 items-end gap-2 overflow-x-auto pb-8">
            {months.map((monthName, index) => {
              const monthData = monthlyData.find(
                (item) => Number(item.month) === index + 1,
              );

              const revenue = Number(monthData?.revenue || 0);

              const maxRevenue = Math.max(
                ...monthlyData.map((item) => Number(item.revenue || 0)),
                1,
              );

              const height =
                revenue > 0 ? Math.max((revenue / maxRevenue) * 100, 4) : 2;

              return (
                <div
                  key={monthName}
                  className="group flex min-w-[58px] flex-1 flex-col items-center justify-end"
                >
                  <div className="relative mb-2 w-full">
                    <div
                      className="mx-auto w-8 rounded-t-lg bg-sky-500 transition-all duration-300 group-hover:bg-sky-600"
                      style={{
                        height: `${height}%`,
                        minHeight: "6px",
                      }}
                    />

                    {revenue > 0 && (
                      <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white group-hover:block">
                        {formatAmount(revenue)}
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-slate-500">
                    {monthName.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PRODUCT + CATEGORY */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* TOP PRODUCTS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-bold text-slate-900">Top Products</h2>

              <p className="text-sm text-slate-500">
                Highest revenue-generating products.
              </p>
            </div>

            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <EmptySmall text="No product data available." />
              ) : (
                topProducts.map((product, index) => {
                  const percentage =
                    totalRevenue > 0
                      ? (Number(product.revenue || 0) / totalRevenue) * 100
                      : 0;

                  return (
                    <div key={product.product}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                            {index + 1}
                          </span>

                          <div>
                            <span className="text-sm font-semibold text-slate-800">
                              {product.product}
                            </span>

                            <p className="text-[11px] text-slate-400">
                              {product.category}
                            </p>
                          </div>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                          {formatAmount(product.revenue)}
                        </span>
                      </div>

                      <div className="ml-10 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-sky-500"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>

                      <p className="ml-10 mt-1 text-xs text-slate-400">
                        {product.quantitySold} items • {percentage.toFixed(1)}%
                        of revenue
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CATEGORY PERFORMANCE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-bold text-slate-900">Category Performance</h2>

              <p className="text-sm text-slate-500">
                Revenue generated by seafood category.
              </p>
            </div>

            <div className="space-y-3">
              {categoryData.length === 0 ? (
                <EmptySmall text="No category data available." />
              ) : (
                categoryData.map((category) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {category.category}
                      </p>

                      <p className="text-xs text-slate-400">
                        {category.quantitySold} items sold
                      </p>
                    </div>

                    <span className="text-sm font-bold text-slate-900">
                      {formatAmount(category.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PAYMENT + AREAS */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* PAYMENT */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-bold text-slate-900">Payment Performance</h2>

              <p className="text-sm text-slate-500">
                COD versus online payments.
              </p>
            </div>

            <div className="space-y-4">
              {paymentData.length === 0 ? (
                <EmptySmall text="No payment data available." />
              ) : (
                paymentData.map((payment) => {
                  const percentage =
                    totalOrders > 0
                      ? (Number(payment.orders || 0) / totalOrders) * 100
                      : 0;

                  return (
                    <div key={payment.paymentMethod}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard size={17} className="text-sky-500" />

                          <span className="text-sm font-semibold text-slate-800">
                            {payment.paymentMethod}
                          </span>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                          {formatAmount(payment.revenue)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-sky-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {payment.orders} orders • {percentage.toFixed(1)}%
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AREAS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-bold text-slate-900">Top Delivery Areas</h2>

              <p className="text-sm text-slate-500">
                Areas generating the most revenue.
              </p>
            </div>

            <div className="space-y-3">
              {areaData.length === 0 ? (
                <EmptySmall text="No area data available." />
              ) : (
                areaData.slice(0, 5).map((area, index) => (
                  <div
                    key={area.city}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-xs font-bold text-sky-600">
                        {index + 1}
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {area.city}
                        </p>

                        <p className="text-xs text-slate-400">
                          {area.orders} orders
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-bold text-slate-900">
                      {formatAmount(area.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MONTHLY REPORT */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-900">Monthly Performance</h2>

            <p className="text-sm text-slate-500">
              Month-by-month delivered order performance.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Month
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Orders
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Revenue
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Avg. Order
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {months.map((monthName, index) => {
                  const month = monthlyData.find(
                    (item) => Number(item.month) === index + 1,
                  );

                  return (
                    <tr
                      key={monthName}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {monthName}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {Number(month?.orders || 0)}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        {formatAmount(month?.revenue || 0)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatAmount(month?.averageOrderValue || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ORDERS TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Delivered Orders</h2>

              <p className="text-sm text-slate-500">
                {filteredOrders.length} orders matching table filters.
              </p>
            </div>

            <div className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
              Delivered
            </div>
          </div>

          {loadingOrders ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-4">
                <Package className="text-slate-400" size={28} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No delivered orders found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Order
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Products
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Area
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          #{order._id?.slice(-6).toUpperCase()}
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusStyle(
                            order.orderStatus,
                          )}`}
                        >
                          Delivered
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {order.user?.fullName ||
                            order.deliveryAddress?.fullName ||
                            "Customer"}
                        </p>

                        <p className="text-xs text-slate-400">
                          {order.user?.email ||
                            order.deliveryAddress?.email ||
                            "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[220px] text-sm font-medium text-slate-800">
                          {getProductNames(order)}
                        </p>

                        <p className="text-xs text-slate-400">
                          {getProductCategory(order)} • {getItemQuantity(order)}{" "}
                          item(s)
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {getOrderArea(order)}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {formatAmount(order.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {getPaymentMethod(order)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/*
========================================
FILTER SELECT
========================================
*/

function FilterSelect({
  label,
  icon,
  value,
  onChange,
  options,
  displayOptions = {},
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {icon}
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {displayOptions[option] || option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

/*
========================================
KPI CARD
========================================
*/

function KpiCard({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600">{icon}</div>
      </div>

      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

/*
========================================
SMALL METRIC
========================================
*/

function SmallMetric({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{title}</p>

      <div className="mt-1 flex items-end justify-between">
        <h3 className="text-xl font-bold text-slate-900">{value}</h3>

        <span className="text-xs text-slate-400">{subtitle}</span>
      </div>
    </div>
  );
}

/*
========================================
EMPTY
========================================
*/

function EmptySmall({ text }) {
  return (
    <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}
