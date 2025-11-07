// services/VNPayService.js
const crypto = require("crypto");
const Order = require("../models/Order");
const qs = require('qs');
const axios = require('axios');

class VNPayService {
  async createPayment(order) {
    const config = {
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
      vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    };
    const params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: config.vnp_TmnCode,
      vnp_Amount: order.totalAmount * 100,
      vnp_CreateDate: new Date()
        .toISOString()
        .replace(/[-:T.]/g, "")
        .slice(0, 14),
      vnp_CurrCode: "VND",
      vnp_IpAddr: "127.0.0.1",
      vnp_Locale: "vn",
      vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
      vnp_OrderType: "billpayment",
      vnp_ReturnUrl:
        process.env.VNPAY_RETURN_URL ||
        "https://localhost:5000/api/orders/vnpay-callback",
      vnp_TxnRef: order._id,
    };
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
      }, {});
    const signData = new URLSearchParams(sortedParams).toString();
    params.vnp_SecureHash = crypto
      .createHmac("sha512", config.vnp_HashSecret)
      .update(signData)
      .digest("hex");
    const paymentUrl = `${config.vnp_Url}?${new URLSearchParams(
      params
    ).toString()}`;
    return paymentUrl;
  }

  async verifyCallback(query) {
    const { vnp_SecureHash, ...otherParams } = query;
    const sortedParams = Object.keys(otherParams)
      .sort()
      .reduce((obj, key) => {
        obj[key] = otherParams[key];
        return obj;
      }, {});
    const signData = new URLSearchParams(sortedParams).toString();
    const calculatedSignature = crypto
      .createHmac("sha512", process.env.VNPAY_HASH_SECRET)
      .update(signData)
      .digest("hex");
    const isSuccess =
      vnp_SecureHash === calculatedSignature &&
      query.vnp_ResponseCode === "00";
    // Cập nhật trạng thái đơn hàng
    const orderId = query.vnp_TxnRef;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        if (isSuccess) {
          order.paymentStatus = "Completed";
          order.transactionId = query.vnp_TransactionNo;
        } else {
          order.paymentStatus = "Failed";
        }
        await order.save();
      }
    }
    return {
      isSuccess,
      orderId,
      transactionId: query.vnp_TransactionNo,
      amount: parseInt(query.vnp_Amount) / 100,
    };
  }

  async refund({ vnp_TxnRef, vnp_Amount, vnp_TransactionNo, vnp_OrderInfo }) {
    const config = {
      vnp_Version: '2.1.0',
      vnp_Command: 'refund',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_TransactionType: '02', // 02: Refund
      vnp_TxnRef,
      vnp_Amount: vnp_Amount * 100, // VNPay yêu cầu số tiền * 100
      vnp_OrderInfo,
      vnp_TransactionNo,
      vnp_CreateBy: 'admin',
      vnp_CreateDate: new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14),
    };

    // Tạo chuỗi hash
    const sorted = Object.keys(config).sort().reduce((r, k) => (r[k] = config[k], r), {});
    const signData = qs.stringify(sorted, { encode: false });
    const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
    const vnp_SecureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sorted.vnp_SecureHash = vnp_SecureHash;

    // Gửi request refund
    const url = process.env.VNPAY_URL + '?' + qs.stringify(sorted, { encode: false });
    const response = await axios.get(url);
    return response.data;
  }
}

module.exports = new VNPayService();
