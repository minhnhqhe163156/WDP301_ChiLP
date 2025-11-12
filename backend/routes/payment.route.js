// routes/payment.route.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller.js");
const authMiddleware = require("../middlewares/authMiddleware");
if (process.env.NODE_ENV === "development") {
  router.get("/test", (req, res) => {
    res.json({
      success: true,
      message: "Payment API is working!",
      timestamp: new Date().toISOString(),
    });
  });
  router.get("/test-cart", paymentController.testCart);
  router.get("/test-zalopay", paymentController.testZaloPay);
  router.get("/test-vnpay", paymentController.testVNPay);
  router.get("/debug-signature", paymentController.debugSignature);
  router.get("/check-zalopay-status", paymentController.checkZaloPayStatus);
}

// router.post(
//   "/vnpay",
//   authMiddleware.verifyToken,
//   authMiddleware.isCustomer,
//   paymentController.createVNPayUrl
// );
router.get("/vnpay/ipn", paymentController.vnpayIpn);

module.exports = router;
