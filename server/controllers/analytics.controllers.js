import Order from "../models/order.model.js";

const getDateRange = (year, month) => {
  if (!year) {
    return null;
  }

  const numericYear = Number(year);

  if (month) {
    const numericMonth = Number(month) - 1;

    return {
      start: new Date(Date.UTC(numericYear, numericMonth, 1)),

      end: new Date(Date.UTC(numericYear, numericMonth + 1, 1)),
    };
  }

  return {
    start: new Date(Date.UTC(numericYear, 0, 1)),

    end: new Date(Date.UTC(numericYear + 1, 0, 1)),
  };
};

/*
  ========================================
  SALES OVERVIEW
  ========================================
*/

export const getSalesAnalytics = async (req, res) => {
  try {
    const { year, month, category, paymentMethod, city } = req.query;

    const match = {
      orderStatus: "delivered",
    };

    const dateRange = getDateRange(year, month);

    if (dateRange) {
      match.createdAt = {
        $gte: dateRange.start,
        $lt: dateRange.end,
      };
    }

    if (paymentMethod && paymentMethod !== "ALL") {
      match.paymentMethod = paymentMethod;
    }

    if (city && city !== "ALL") {
      match["deliveryAddress.city"] = city;
    }

    /*
      Category filtering requires checking
      the embedded order items.
    */

    if (category && category !== "ALL") {
      match["items.category"] = category;
    }

    const result = await Order.aggregate([
      {
        $match: match,
      },

      {
        $group: {
          _id: null,

          totalOrders: {
            $sum: 1,
          },

          totalRevenue: {
            $sum: "$totalAmount",
          },

          totalSubtotal: {
            $sum: "$subtotal",
          },

          totalDeliveryFees: {
            $sum: "$deliveryFee",
          },
        },
      },

      {
        $project: {
          _id: 0,

          totalOrders: 1,

          totalRevenue: 1,

          totalSubtotal: 1,

          totalDeliveryFees: 1,

          averageOrderValue: {
            $cond: [
              {
                $eq: ["$totalOrders", 0],
              },

              0,

              {
                $divide: ["$totalRevenue", "$totalOrders"],
              },
            ],
          },
        },
      },
    ]);

    const analytics = result[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalSubtotal: 0,
      totalDeliveryFees: 0,
      averageOrderValue: 0,
    };

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Sales analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales analytics",
      error: error.message,
    });
  }
};

/*
  ========================================
  MONTHLY SALES
  ========================================
*/

export const getMonthlyAnalytics = async (req, res) => {
  try {
    const year = Number(req.query.year);

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Year is required",
      });
    }

    const startDate = new Date(Date.UTC(year, 0, 1));

    const endDate = new Date(Date.UTC(year + 1, 0, 1));

    const data = await Order.aggregate([
      {
        $match: {
          orderStatus: "delivered",

          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $month: "$createdAt",
          },

          orders: {
            $sum: 1,
          },

          revenue: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $project: {
          _id: 0,

          month: "$_id",

          orders: 1,

          revenue: 1,

          averageOrderValue: {
            $cond: [
              {
                $eq: ["$orders", 0],
              },

              0,

              {
                $divide: ["$revenue", "$orders"],
              },
            ],
          },
        },
      },

      {
        $sort: {
          month: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Monthly analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly analytics",
      error: error.message,
    });
  }
};

/*
  ========================================
  TOP PRODUCTS
  ========================================
*/

export const getProductAnalytics = async (req, res) => {
  try {
    const { year, month } = req.query;

    const match = {
      orderStatus: "delivered",
    };

    const dateRange = getDateRange(year, month);

    if (dateRange) {
      match.createdAt = {
        $gte: dateRange.start,
        $lt: dateRange.end,
      };
    }

    const data = await Order.aggregate([
      {
        $match: match,
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.name",

          category: {
            $first: "$items.category",
          },

          quantitySold: {
            $sum: "$items.quantity",
          },

          revenue: {
            $sum: {
              $multiply: ["$items.price", "$items.quantity"],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,

          product: "$_id",

          category: 1,

          quantitySold: 1,

          revenue: 1,
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },

      {
        $limit: 10,
      },
    ]);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Product analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product analytics",
      error: error.message,
    });
  }
};

/*
  ========================================
  CATEGORY ANALYTICS
  ========================================
*/

export const getCategoryAnalytics = async (req, res) => {
  try {
    const { year, month } = req.query;

    const match = {
      orderStatus: "delivered",
    };

    const dateRange = getDateRange(year, month);

    if (dateRange) {
      match.createdAt = {
        $gte: dateRange.start,
        $lt: dateRange.end,
      };
    }

    const data = await Order.aggregate([
      {
        $match: match,
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.category",

          quantitySold: {
            $sum: "$items.quantity",
          },

          revenue: {
            $sum: {
              $multiply: ["$items.price", "$items.quantity"],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,

          category: "$_id",

          quantitySold: 1,

          revenue: 1,
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Category analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category analytics",
      error: error.message,
    });
  }
};

/*
  ========================================
  PAYMENT ANALYTICS
  ========================================
*/

export const getPaymentAnalytics = async (req, res) => {
  try {
    const { year, month } = req.query;

    const match = {
      orderStatus: "delivered",
    };

    const dateRange = getDateRange(year, month);

    if (dateRange) {
      match.createdAt = {
        $gte: dateRange.start,
        $lt: dateRange.end,
      };
    }

    const data = await Order.aggregate([
      {
        $match: match,
      },

      {
        $group: {
          _id: "$paymentMethod",

          orders: {
            $sum: 1,
          },

          revenue: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $project: {
          _id: 0,

          paymentMethod: "$_id",

          orders: 1,

          revenue: 1,
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Payment analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment analytics",
      error: error.message,
    });
  }
};

/*
  ========================================
  AREA ANALYTICS
  ========================================
*/

export const getAreaAnalytics = async (req, res) => {
  try {
    const { year, month } = req.query;

    const match = {
      orderStatus: "delivered",
    };

    const dateRange = getDateRange(year, month);

    if (dateRange) {
      match.createdAt = {
        $gte: dateRange.start,
        $lt: dateRange.end,
      };
    }

    const data = await Order.aggregate([
      {
        $match: match,
      },

      {
        $group: {
          _id: "$deliveryAddress.city",

          orders: {
            $sum: 1,
          },

          revenue: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $project: {
          _id: 0,

          city: "$_id",

          orders: 1,

          revenue: 1,
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Area analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch area analytics",
      error: error.message,
    });
  }
};
