const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/authMiddleware");

// Tạo đơn hàng mới (chỉ dành cho customer)
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isCustomer,
  orderController.createOrder
);

// Xử lý callback thanh toán ZaloPay
router.post("/zalopay-callback", orderController.handleZaloPayCallback);

// Xử lý callback thanh toán VNPay
router.get("/vnpay-callback", orderController.handleVNPayCallback);

// Lấy tất cả đơn hàng (chỉ dành cho admin)
router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  orderController.getOrders
);

// Lấy lịch sử đơn hàng của customer
router.get(
  "/my-orders",
  authMiddleware.verifyToken,
  authMiddleware.isCustomer,
  orderController.getMyOrders
);

// Lấy danh sách đơn hàng của seller
router.get(
  "/seller-orders",
  authMiddleware.verifyToken,
  authMiddleware.isSeller,
  orderController.getSellerOrders
);

// Lấy chi tiết đơn hàng của seller
router.get(
  "/seller/:id",
  authMiddleware.verifyToken,
  authMiddleware.isSeller,
  orderController.getSellerOrderDetails
);

// Cập nhật trạng thái đơn hàng (dành cho seller)
router.patch(
  "/seller/:id/status",
  authMiddleware.verifyToken,
  authMiddleware.isSeller,
  orderController.updateOrderStatusBySeller
);

// Thống kê doanh số cho seller
router.get(
  "/seller-statistics",
  authMiddleware.verifyToken,
  authMiddleware.isSeller,
  orderController.getSellerStatistics
);

// Thống kê doanh số cho admin
router.get(
  "/admin-statistics",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  orderController.getAdminStatistics
);

// Hủy sản phẩm khỏi đơn hàng (chỉ dành cho customer)
router.post(
  "/cancel-product",
  authMiddleware.verifyToken,
  authMiddleware.isCustomer,
  orderController.cancelProductInOrder
);

// Lấy thông tin đơn hàng theo ID (cho tất cả role có token hợp lệ)
router.get(
  "/:id",
  authMiddleware.verifyToken,
  orderController.getOrderById
);

// Cập nhật trạng thái đơn hàng (chỉ dành cho admin)
router.patch(
  "/:id/status",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  orderController.updateOrderStatus
);

// Hủy đơn hàng (chỉ dành cho customer)
router.patch(
  "/:id/cancel",
  authMiddleware.verifyToken,
  authMiddleware.isCustomer,
  orderController.cancelOrder
);

// Xác nhận đã nhận hàng (chỉ dành cho customer)
router.patch(
  "/:id/confirm-received",
  authMiddleware.verifyToken,
  authMiddleware.isCustomer,
  orderController.confirmOrderReceived
);

// Refund đơn hàng (chỉ dành cho customer)
router.patch(
  "/:id/refund",
  authMiddleware.verifyToken,
  authMiddleware.isCustomer,
  orderController.refundOrder
);

// Gửi lại email hoàn tiền (chỉ dành cho customer)
router.post(
  "/:id/send-refund-email",
  authMiddleware.verifyToken,
  authMiddleware.isCustomer,
  orderController.sendRefundEmailAgain
);

// Xác nhận đã thu tiền (chỉ dành cho admin hoặc seller)
router.patch(
  "/:id/confirm-payment",
  authMiddleware.verifyToken,
  (req, res, next) => {
    // Cho phép cả admin và seller xác nhận thanh toán
    if (req.user.role === "admin" || req.user.role === "seller") return next();
    return res.status(403).json({ message: "Forbidden" });
  },
  orderController.confirmPayment
);

// // Bổ sung: Thêm sản phẩm vào đơn hàng (dành cho seller)
// router.post(
//   "/:id/add-product",
//   authMiddleware.verifyToken,
//   authMiddleware.isSeller,
//   orderController.addProductToOrder
// );

// // Bổ sung: Hủy đơn hàng bởi seller (nếu có quyền, cần logic trong controller)
// router.patch(
//   "/seller/:id/cancel",
//   authMiddleware.verifyToken,
//   authMiddleware.isSeller,
//   orderController.cancelOrderBySeller
// );

module.exports = router;