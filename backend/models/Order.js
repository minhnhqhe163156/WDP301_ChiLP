// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      discount_price: { type: Number },
      seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Thêm để hỗ trợ getSellerOrders
    },
  ],
  totalAmount: { type: Number, required: true },
  shipping_address: {
    // country: { type: String, required: true },         // Quốc gia (bỏ vì chỉ bán trong nước)
    province: { type: String, required: true }, // Tỉnh/Thành phố
    district: { type: String, required: true }, // Quận/Huyện
    ward: { type: String, required: true }, // Phường/Xã
    postalCode: { type: String }, // Mã bưu điện
    name: { type: String, required: true }, // Họ tên người nhận
    phone: { type: String, required: true }, // Số điện thoại
    address: { type: String, required: true }, // Địa chỉ chi tiết (số nhà, đường, ...)
  },
  voucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
  },
  discount: { type: Number, default: 0 }, // Số tiền giảm giá từ voucher
  paymentMethod: {
    type: String,
    enum: ["ZaloPay", "VNPay", "COD"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Refunded", "Failed"],
    default: "Pending",
  },
  orderStatus: {
    type: String,
    enum: ["Pending", "Shipping", "Delivered", "Cancelled"],
    default: "Pending",
  },
  transactionId: { type: String }, // Lưu mã giao dịch từ ZaloPay/VNPay
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

orderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Order", orderSchema, "orders");
