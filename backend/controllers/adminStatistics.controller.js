const Order = require("../models/Order");

const getRevenueStats = async (req, res) => {
  try {
    const { type } = req.query;
    const now = new Date();

    let matchStage = {
      paymentStatus: "Completed",
      orderStatus:"Delivered"
    };

    let groupStage;
    if (type === "week") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchStage.createdAt = { $gte: sevenDaysAgo };

      groupStage = {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
        total: { $sum: "$totalAmount" },
      };
    } else {
      // Mặc định thống kê theo tháng (12 tháng gần nhất)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(now.getMonth() - 11);
      matchStage.createdAt = { $gte: twelveMonthsAgo };

      groupStage = {
        _id: {
          $dateToString: { format: "%Y-%m", date: "$updatedAt" },
        },
        total: { $sum: "$totalAmount" },
      };
    }

    const revenue = await Order.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json(revenue);
  } catch (error) {
    console.error("Lỗi thống kê doanh thu:", error);
    return res.status(500).json({
      message: "Lỗi server khi thống kê doanh thu",
      error: error.message,
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const { type } = req.query;
    const now = new Date();

    let matchStage = {
      paymentStatus: "Completed",
      orderStatus:"Delivered"
    };

    let groupStage;

    if (type === "week") {
      // Thống kê 7 ngày gần nhất
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 6); // Bao gồm cả hôm nay
      matchStage.createdAt = { $gte: sevenDaysAgo };

      groupStage = {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
        totalOrders: { $sum: 1 },
      };
    } else {
      // Mặc định thống kê theo tháng trong 12 tháng gần nhất
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(now.getMonth() - 11);
      twelveMonthsAgo.setDate(1);
      matchStage.createdAt = { $gte: twelveMonthsAgo };

      groupStage = {
        _id: {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        },
        totalOrders: { $sum: 1 },
      };
    }

    const orders = await Order.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi thống kê đơn hàng:", error);
    return res.status(500).json({
      message: "Lỗi server khi thống kê đơn hàng",
      error: error.message,
    });
  }
};

const getProductCategoryStats = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { paymentStatus: "Completed"  , orderStatus:"Delivered"} },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category_id", // nhóm theo ID danh mục
          totalSold: { $sum: "$items.quantity" }
        }
      },
      {
        $lookup: {
          from: "category", // tên collection đúng là 'category' (theo model bạn khai báo)
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          _id: 0,
          name: "$categoryInfo.name",
          value: "$totalSold"
        }
      },
      { $sort: { value: -1 } }
    ]);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi thống kê theo danh mục:", error);
    return res.status(500).json({
      message: "Lỗi server khi thống kê danh mục",
      error: error.message
    });
  }
};



module.exports = {
  getRevenueStats,
  getOrderStats,
  getProductCategoryStats,
};
