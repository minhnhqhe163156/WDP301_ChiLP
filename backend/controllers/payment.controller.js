const axios = require("axios");
const crypto = require("crypto");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ZaloPayService = require("../services/ZaloPayService");
const VNPayService = require("../services/VNPayService");

// Test kết nối backend
exports.testConnection = async (req, res) => {
  try {
    console.log("=== [PACEUPSHOP][BE] Test kết nối backend");
    res.json({
      success: true,
      message: "Payment API is working!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("=== [PACEUPSHOP][BE] Lỗi test kết nối:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test giỏ hàng
exports.testCart = async (req, res) => {
  try {
    console.log("=== [PACEUPSHOP][BE] Test giỏ hàng");
    const testCart = {
      user: "test_user_id",
      items: [
        {
          product: {
            _id: "test_product_1",
            name: "Test Product 1",
            price: 100000,
            imageurl: ["https://via.placeholder.com/100"],
          },
          quantity: 2,
          price: 100000,
        },
        {
          product: {
            _id: "test_product_2",
            name: "Test Product 2",
            price: 200000,
            imageurl: ["https://via.placeholder.com/100"],
          },
          quantity: 1,
          price: 200000,
        },
      ],
      subtotal: 300000,
      shipping: 30000,
      total: 330000,
    };
    res.json({ success: true, cart: testCart });
  } catch (error) {
    console.error("=== [PACEUPSHOP][BE] Lỗi test giỏ hàng:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test ZaloPay integration
exports.testZaloPay = async (req, res) => {
  try {
    console.log("=== [PACEUPSHOP][BE] Test ZaloPay integration");
    const testOrder = {
      _id: "test_order_id",
      userId: "test_user_id",
      totalAmount: 100000,
      items: [{ productId: "test_product_1", quantity: 1, price: 100000 }],
    };
    const orderUrl = await ZaloPayService.createPayment(testOrder);
    res.json({
      success: true,
      test_data: {
        app_trans_id: `test_${Date.now()}`,
        amount: testOrder.totalAmount,
        mac: crypto
          .createHmac("sha256", process.env.ZALOPAY_KEY1)
          .update(`test_data|${testOrder.totalAmount}`)
          .digest("hex"),
      },
      zalopay_response: {
        returncode: 1,
        returnmessage: "Test success",
        orderurl: orderUrl,
      },
    });
  } catch (error) {
    console.error("=== [PACEUPSHOP][BE] Lỗi test ZaloPay:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test VNPay integration
exports.testVNPay = async (req, res) => {
  try {
    console.log("=== [PACEUPSHOP][BE] Test VNPay integration");
    const testOrder = {
      _id: "test_order_id",
      totalAmount: 100000,
      items: [{ productId: "test_product_1", quantity: 1, price: 100000 }],
    };
    const paymentUrl = await VNPayService.createPayment(testOrder);
    res.json({
      success: true,
      orderId: testOrder._id,
      amount: testOrder.totalAmount,
      bankCode: "NCB",
      paymentUrl,
      isRealPayment: true,
    });
  } catch (error) {
    console.error("=== [PACEUPSHOP][BE] Lỗi test VNPay:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Debug VNPay signature
exports.debugSignature = async (req, res) => {
  try {
    console.log("=== [PACEUPSHOP][BE] Debug VNPay signature");
    const testParams = {
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: 10000000,
      vnp_OrderInfo: "Test order",
      vnp_TxnRef: "test_order_id",
    };
    const sortedParams = Object.keys(testParams)
      .sort()
      .reduce((obj, key) => {
        obj[key] = testParams[key];
        return obj;
      }, {});
    const signData = new URLSearchParams(sortedParams).toString();
    const signature = crypto
      .createHmac("sha512", process.env.VNPAY_HASH_SECRET)
      .update(signData)
      .digest("hex");
    res.json({
      success: true,
      debug: {
        tmnCode: process.env.VNPAY_TMN_CODE,
        secretKey: process.env.VNPAY_HASH_SECRET.substring(0, 8) + "...",
        orderId: testParams.vnp_TxnRef,
        amount: testParams.vnp_Amount / 100,
        vnpayAmount: testParams.vnp_Amount,
        signature,
      },
    });
  } catch (error) {
    console.error("=== [PACEUPSHOP][BE] Lỗi debug VNPay signature:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Kiểm tra trạng thái ZaloPay
exports.checkZaloPayStatus = async (req, res) => {
  try {
    console.log("=== [PACEUPSHOP][BE] Kiểm tra trạng thái ZaloPay");
    const testAppTransId = `test_${Date.now()}`;
    const data = `${process.env.ZALOPAY_APP_ID}|${testAppTransId}|${process.env.ZALOPAY_KEY1}`;
    const mac = crypto
      .createHmac("sha256", process.env.ZALOPAY_KEY1)
      .update(data)
      .digest("hex");
    res.json({
      success: true,
      app_trans_id: testAppTransId,
      mac,
      status: "Simulated success",
    });
  } catch (error) {
    console.error(
      "=== [PACEUPSHOP][BE] Lỗi kiểm tra trạng thái ZaloPay:",
      error
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xử lý VNPay IPN (Instant Payment Notification)
exports.vnpayIpn = async (req, res) => {
  try {
    console.log("=== [PACEUPSHOP][BE] Nhận VNPay IPN:", req.query);
    const result = await VNPayService.verifyCallback(req.query);
    if (result.isSuccess) {
      console.log("=== [PACEUPSHOP][BE] VNPay IPN thành công:", result.orderId);
      res.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      console.error("=== [PACEUPSHOP][BE] VNPay IPN thất bại");
      res.json({
        RspCode: "97",
        Message: "Invalid Signature or Payment Failed",
      });
    }
  } catch (error) {
    console.error("=== [PACEUPSHOP][BE] Lỗi xử lý VNPay IPN:", error);
    res.status(500).json({ RspCode: "99", Message: "Internal server error" });
  }
};
