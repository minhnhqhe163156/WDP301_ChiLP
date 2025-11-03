const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
const ZaloPayService = require("../services/ZaloPayService");
const VNPayService = require("../services/VNPayService");
const mongoose = require("mongoose");
const { sendRefundEmail } = require('../utils/sendMail');
const Notification = require("../models/Notification");

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log("=== [PACEUPSHOP][BE] Nhận request tạo order:", req.body);
    const { user_id, paymentMethod, shipping_address, items, voucher } = req.body;

    if (!user_id) {
      console.error("=== [PACEUPSHOP][BE] Thiếu user_id");
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Thiếu user_id" });
    }
    const user = await User.findById(user_id).session(session);
    if (!user) {
      console.error("=== [PACEUPSHOP][BE] User không tồn tại:", user_id);
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User không tồn tại" });
    }
    if (
      !shipping_address ||
      !shipping_address.province ||
      !shipping_address.district ||
      !shipping_address.ward ||
      !shipping_address.name ||
      !shipping_address.phone ||
      !shipping_address.address
    ) {
      console.error("=== [PACEUPSHOP][BE] Thiếu thông tin địa chỉ giao hàng");
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Thiếu thông tin địa chỉ giao hàng" });
    }
    const validMethods = ["ZaloPay", "VNPay", "COD"];
    let normalizedPaymentMethod = null;
    if (paymentMethod) {
      const lowerCaseMethod = paymentMethod.toLowerCase();
      if (lowerCaseMethod === "zalopay") {
        normalizedPaymentMethod = "ZaloPay";
      } else if (lowerCaseMethod === "vnpay") {
        normalizedPaymentMethod = "VNPay";
      } else if (lowerCaseMethod === "cod") {
        normalizedPaymentMethod = "COD";
      }
    }
    if (!validMethods.includes(normalizedPaymentMethod)) {
      console.error(
        `=== [PACEUPSHOP][BE] Phương thức thanh toán không hợp lệ: received=${paymentMethod}, normalized=${normalizedPaymentMethod}, validMethods=${validMethods.join(", ")}`
      );
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không hợp lệ" });
    }

    let orderItems = [];
    let totalAmount = 0;
    let cart = null;

    if (items && items.length > 0) {
      // Tạo order trực tiếp từ items truyền lên (MUA NGAY)
      for (const reqItem of items) {
        const product = await Product.findById(reqItem.productId);
        if (!product || product.status !== "available" || product.quantity < reqItem.quantity) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: `Sản phẩm không có sẵn hoặc số lượng không đủ: ${reqItem.productId}` });
        }
        const price = product.discount_price || product.price;
        orderItems.push({
          productId: product._id,
          quantity: reqItem.quantity,
          price: price,
          discount_price: product.discount_price,
          seller_id: product.seller_id,
          size: reqItem.size, // nếu có size
        });
        totalAmount += price * reqItem.quantity;
        await Product.findByIdAndUpdate(
          product._id,
          { $inc: { quantity: -reqItem.quantity } },
          { session }
        );
      }
    } else {
      // Nếu không truyền items, lấy từ giỏ hàng như cũ
      cart = await Cart.findOne({ user: user_id })
        .populate("items.product")
        .session(session);
      if (!cart || !cart.items.length) {
        console.error("=== [PACEUPSHOP][BE] Giỏ hàng trống");
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Giỏ hàng trống" });
      }
      for (const item of cart.items) {
        const product = item.product;
        if (product.status !== "available" || product.quantity < item.quantity) {
          console.error(
            `=== [PACEUPSHOP][BE] Sản phẩm ${product.product_name} không có sẵn hoặc số lượng không đủ`
          );
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `Sản phẩm ${product.product_name} không có sẵn hoặc số lượng không đủ`,
          });
        }
        const price = product.discount_price || product.price;
        orderItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: price,
          discount_price: product.discount_price,
          seller_id: product.seller_id,
        });
        totalAmount += price * item.quantity;
        await Product.findByIdAndUpdate(
          product._id,
          { $inc: { quantity: -item.quantity } },
          { session }
        );
      }
    }

    // Sửa lại: luôn miễn phí ship
    const shipping = 0;
    // totalAmount += shipping; // Không cộng phí ship vào tổng tiền

    // Tính giảm giá voucher nếu có
    let discount = 0;
    let voucherDoc = null;
    if (voucher) {
      voucherDoc = await require("../models/Voucher").findOne({ voucher_code: voucher, status: "active" });
      console.log("Voucher tìm được:", voucherDoc);
      if (voucherDoc) {
        if (voucherDoc.discount_type === "percent") {
          discount = Math.floor(totalAmount * voucherDoc.discount_value / 100);
          if (voucherDoc.maximum_discount) {
            discount = Math.min(discount, voucherDoc.maximum_discount);
          }
        } else {
          discount = Math.min(voucherDoc.discount_value, voucherDoc.maximum_discount || voucherDoc.discount_value);
        }
      }
    }
    const finalTotal = totalAmount - discount;

    console.log("=== [PACEUPSHOP][BE] OrderItems:", orderItems);
    console.log("=== [PACEUPSHOP][BE] Tổng tiền trước giảm:", totalAmount);
    if (voucherDoc) {
      console.log("=== [PACEUPSHOP][BE] Voucher áp dụng:", voucherDoc);
      console.log("=== [PACEUPSHOP][BE] Discount tính được:", discount);
    }
    console.log("=== [PACEUPSHOP][BE] Tổng tiền sau giảm:", finalTotal);

    const order = new Order({
      userId: user_id,
      items: orderItems,
      totalAmount: finalTotal,
      shipping_address,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: "Pending",
      orderStatus: "Pending",
      voucher: voucherDoc?._id,
      discount,
    });
    await order.save({ session });
    // Tạo notification cho customer
    await Notification.create({
      user_id: user_id,
      role: 'customer',
      type: 'order',
      message: `Đơn hàng của bạn đã được tạo thành công!`,
      link: `/orders/${order._id}`,
      is_read: false
    });
    // Tạo notification cho từng seller liên quan
    const sellerIds = [...new Set(orderItems.map(item => item.seller_id.toString()))];
    for (const sellerId of sellerIds) {
      await Notification.create({
        user_id: sellerId,
        role: 'seller',
        type: 'order',
        message: `Bạn có đơn hàng mới từ khách hàng ${user.name || user.email || user._id}`,
        link: `/seller/orders/${order._id}`,
        is_read: false
      });
    }
    console.log("=== [DEBUG][ORDER] Order đã lưu vào DB:", order._id);
    await session.commitTransaction();
    session.endSession();
    console.log(
      "=== [DEBUG][ORDER] Transaction đã commit, order đã có trong DB:",
      order._id
    );

    let paymentUrl = null;
    if (normalizedPaymentMethod === "COD") {
      order.orderStatus = "Pending";
      order.paymentStatus = "Pending";
      await order.save();
      if (cart) await Cart.findOneAndDelete({ user: user_id });
      console.log("=== [PACEUPSHOP][BE] Order COD đã tạo:", order._id);
      console.log("=== [PACEUPSHOP][BE] Response trả về FE:", { message: "Order created with COD", order });
      return res.status(201).json({ message: "Order created with COD", order });
    } else if (normalizedPaymentMethod === "ZaloPay") {
      try {
        paymentUrl = await ZaloPayService.createPayment(order);
        console.log(
          "=== [PACEUPSHOP][BE] Order ZaloPay đã tạo:",
          order._id,
          paymentUrl
        );
      } catch (error) {
        console.error(
          `=== [PACEUPSHOP][BE] Lỗi tạo paymentUrl ZaloPay: ${error.message}`
        );
        console.log("=== [PACEUPSHOP][BE] Response trả về FE (ZaloPay lỗi):", { message: "Lỗi tạo paymentUrl ZaloPay", error: error.message });
        return res.status(500).json({
          message: "Lỗi tạo paymentUrl ZaloPay",
          error: error.message,
        });
      }
    } else if (normalizedPaymentMethod === "VNPay") {
      try {
        paymentUrl = await VNPayService.createPayment(order);
        console.log(
          "=== [PACEUPSHOP][BE] Order VNPay đã tạo:",
          order._id,
          paymentUrl
        );
      } catch (error) {
        console.error(
          `=== [PACEUPSHOP][BE] Lỗi tạo paymentUrl VNPay: ${error.message}`
        );
        console.log("=== [PACEUPSHOP][BE] Response trả về FE (VNPay lỗi):", { message: "Lỗi tạo paymentUrl VNPay", error: error.message });
        return res.status(500).json({
          message: "Lỗi tạo paymentUrl VNPay",
          error: error.message,
        });
      }
    }
    console.log("=== [PACEUPSHOP][BE] Response trả về FE (thành công):", {
      success: true,
      orderId: order._id,
      paymentUrl: paymentUrl || null,
    });
    return res.status(200).json({
      success: true,
      orderId: order._id,
      paymentUrl: paymentUrl || null,
    });
  } catch (err) {
    console.error("=== [PACEUPSHOP][BE] Lỗi khi tạo order:", err.stack);
    console.log("=== [PACEUPSHOP][BE] Response trả về FE (catch lỗi):", { message: "Lỗi hệ thống khi tạo đơn hàng", error: err.message });
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Lỗi hệ thống khi tạo đơn hàng" });
  }
};

exports.handleZaloPayCallback = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log(
      "=== [DEBUG][ZaloPay] Nhận callback body:",
      JSON.stringify(req.body)
    );
    const result = await ZaloPayService.verifyCallback(req.body);

    if (!result.isSuccess) {
      console.error("=== [DEBUG][ZaloPay] Thanh toán thất bại:", result);
      const order = await Order.findById(result.orderId).session(session);
      if (order) {
        order.paymentStatus = "Failed";
        order.orderStatus = "Cancelled";
        await order.save({ session });
        console.log(
          "=== [DEBUG][ZaloPay] Cập nhật trạng thái Failed:",
          order._id
        );
      }
      await session.commitTransaction();
      session.endSession();
      return res.json({ return_code: -1, return_message: "Payment failed" });
    }

    const order = await Order.findById(result.orderId).session(session);
    if (!order) {
      console.error(
        "=== [DEBUG][ZaloPay] Order không tìm thấy:",
        result.orderId
      );
      await session.abortTransaction();
      session.endSession();
      return res.json({ return_code: -1, return_message: "Order not found" });
    }

    if (order.paymentStatus === "Completed") {
      console.log("=== [DEBUG][ZaloPay] Order đã thanh toán:", order._id);
      await session.commitTransaction();
      session.endSession();
      return res.json({ return_code: 1, return_message: "Already processed" });
    }

    if (parseInt(result.amount) !== order.totalAmount) {
      console.error("=== [DEBUG][ZaloPay] Số tiền không khớp:", {
        expected: order.totalAmount,
        received: result.amount,
      });
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
      await order.save({ session });
      await session.commitTransaction();
      session.endSession();
      return res.json({ return_code: -2, return_message: "Amount mismatch" });
    }

    order.paymentStatus = "Completed";
    order.orderStatus = "Shipping";
    order.transactionId = result.transactionId;
    await order.save({ session });
    console.log(
      "=== [DEBUG][ZaloPay] Cập nhật trạng thái Completed:",
      order._id
    );

    await Cart.findOneAndDelete({ user: order.userId }, { session });
    console.log("=== [DEBUG][ZaloPay] Xóa giỏ hàng:", order.userId);

    console.log("=== [DEBUG][ZaloPay] result.redirecturl:", result.redirecturl);
    let redirectUrl =
      result.redirecturl || "https://localhost:5173/checkout/success";
    const hasQuery = redirectUrl.includes("?");
    redirectUrl +=
      (hasQuery ? "&" : "?") +
      `orderId=${order._id}&status=1&amount=${order.totalAmount}&paymentMethod=ZaloPay`;
    console.log("=== [DEBUG][ZaloPay] Constructed redirectUrl:", redirectUrl);
    await session.commitTransaction();
    session.endSession();
    console.log("=== [DEBUG][ZaloPay] Final redirect to:", redirectUrl);
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("=== [DEBUG][ZaloPay] Lỗi callback:", error.stack);
    // Nếu có orderId trong body thì cập nhật trạng thái đơn hàng
    if (req.body && req.body.orderId) {
      const order = await Order.findById(req.body.orderId);
      if (order) {
        order.paymentStatus = "Failed";
        order.orderStatus = "Cancelled";
        await order.save();
      }
    }
    await session.abortTransaction();
    session.endSession();
    return res.json({ return_code: 0, return_message: "System error" });
  }
};

exports.handleVNPayCallback = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    console.log("=== [PACEUPSHOP][BE] Nhận callback VNPay:", req.query);
    const result = await VNPayService.verifyCallback(req.query);
    if (!result.isSuccess) {
      console.error("=== [PACEUPSHOP][BE] Xác thực VNPay thất bại:", result);
      // Nếu có orderId thì cập nhật trạng thái đơn hàng
      if (result.orderId) {
        const order = await Order.findById(result.orderId).session(session);
        if (order) {
          order.paymentStatus = "Failed";
          order.orderStatus = "Cancelled";
          await order.save({ session });
        }
      }
      const redirectUrl = `https://localhost:5173/checkout/success?orderId=${result.orderId}&status=0`;
      await session.abortTransaction();
      session.endSession();
      return res.redirect(redirectUrl);
    }

    const order = await Order.findById(result.orderId).session(session);
    if (!order) {
      console.error(
        "=== [PACEUPSHOP][BE] Order không tìm thấy:",
        result.orderId
      );
      const redirectUrl = `https://localhost:5173/checkout/success?orderId=${result.orderId}&status=0`;
      await session.abortTransaction();
      session.endSession();
      return res.redirect(redirectUrl);
    }

    if (order.paymentStatus === "Completed") {
      console.log("=== [PACEUPSHOP][BE] Order đã thanh toán:", order._id);
      const redirectUrl = `https://localhost:5173/checkout/success?paymentMethod=VNPay&orderId=${order._id}&status=1&amount=${order.totalAmount}`;
      await session.commitTransaction();
      session.endSession();
      return res.redirect(redirectUrl);
    }

    if (result.amount !== order.totalAmount) {
      console.error("=== [PACEUPSHOP][BE] Số tiền không khớp:", {
        expected: order.totalAmount,
        received: result.amount,
      });
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
      await order.save({ session });
      const redirectUrl = `https://localhost:5173/checkout/success?orderId=${result.orderId}&status=0`;
      await session.abortTransaction();
      session.endSession();
      return res.redirect(redirectUrl);
    }

    order.paymentStatus = "Completed";
    order.orderStatus = "Shipping";
    order.transactionId = result.transactionId;
    await order.save({ session });

    await Cart.findOneAndDelete({ user: order.userId }, { session });
    console.log(
      `=== [PACEUPSHOP][BE] Đã xóa giỏ hàng của user ${order.userId}`
    );

    console.log("=== [PACEUPSHOP][BE] Thanh toán VNPay thành công:", order._id);
    const redirectUrl = `https://localhost:5173/checkout/success?paymentMethod=VNPay&orderId=${order._id}&status=1&amount=${order.totalAmount}`;
    await session.commitTransaction();
    session.endSession();
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("=== [PACEUPSHOP][BE] Lỗi xử lý callback VNPay:", error);
    // Nếu có orderId trong query thì cập nhật trạng thái đơn hàng
    if (req.query && req.query.vnp_TxnRef) {
      const order = await Order.findById(req.query.vnp_TxnRef);
      if (order) {
        order.paymentStatus = "Failed";
        order.orderStatus = "Cancelled";
        await order.save();
      }
    }
    const redirectUrl = `https://localhost:5173/checkout/success?status=0`;
    await session.abortTransaction();
    session.endSession();
    return res.redirect(redirectUrl);
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId items.productId");
    res.status(200).json(orders);
  } catch (error) {
    console.error(
      "=== [PACEUPSHOP][BE] Lỗi khi lấy danh sách đơn hàng:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId items.productId"
    );
    if (!order) {
      console.error(
        "=== [PACEUPSHOP][BE] Order không tìm thấy:",
        req.params.id
      );
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("=== [PACEUPSHOP][BE] Lỗi khi lấy đơn hàng:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      Pending: ["Shipping", "Cancelled", "Delivered"],
      Shipping: ["Delivered", "Cancelled"],
      Delivered: [],
      Cancelled: [],
    };
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.error(
        "=== [PACEUPSHOP][BE] Order không tìm thấy:",
        req.params.id
      );
      return res.status(404).json({ message: "Order not found" });
    }

    if (!validTransitions[order.orderStatus].includes(status)) {
      console.error(
        `=== [PACEUPSHOP][BE] Chuyển trạng thái không hợp lệ từ ${order.orderStatus} sang ${status}`
      );
      return res.status(400).json({
        message: `Invalid transition from ${order.orderStatus} to ${status}`,
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status, updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(
      "=== [PACEUPSHOP][BE] Lỗi khi cập nhật trạng thái đơn hàng:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Chỉ cho phép hủy ở trạng thái hợp lệ
    if (!['Pending', 'Shipping', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order cannot be canceled at this stage' });
    }

    // Nếu đã thanh toán online qua VNPay và chưa refund
    if (order.paymentMethod === 'vnpay' && order.paymentStatus === 'Completed') {
      // Gọi refund
      const refundResult = await VNPayService.refund({
        vnp_TxnRef: order.vnp_TxnRef, // mã giao dịch lưu khi thanh toán
        vnp_Amount: order.totalAmount,
        vnp_TransactionNo: order.vnp_TransactionNo, // mã giao dịch thực tế từ VNPay
        vnp_OrderInfo: `Refund for order ${order._id}`,
      });
      console.log('[VNPay Refund Result]', refundResult);
      if (refundResult.vnp_ResponseCode === '00') {
        order.paymentStatus = 'Refunded';
      } else {
        return res.status(400).json({ success: false, message: 'Refund failed', refundResult });
      }
    } else {
      // Nếu chưa thanh toán hoặc thanh toán thất bại, chuyển thành Failed
      if (order.paymentStatus === 'Pending') {
        order.paymentStatus = 'Failed';
      }
    }

    // Hoàn kho: tăng lại số lượng sản phẩm
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: item.quantity },
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();
    
    // Populate lại dữ liệu sản phẩm trước khi trả về
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.productId",
        model: "Product",
        select: "product_name imageurl",
      });
    
    res.json({ success: true, order: populatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Chỉ cho phép refund nếu đã thanh toán online và chưa refund
    if (order.paymentMethod !== 'VNPay' || order.paymentStatus !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Order is not eligible for refund' });
    }

    // Nếu là sandbox, luôn trả về thành công
    if (process.env.NODE_ENV === 'development' || (process.env.VNPAY_URL && process.env.VNPAY_URL.includes('sandbox'))) {
      order.paymentStatus = 'Refunded';
      await order.save();
      // Lấy email user và FAKE gửi email
      const user = await User.findById(order.userId);
      if (user && user.email) {
        console.log(`[FAKE EMAIL] Đã gửi email hoàn tiền tới ${user.email} cho đơn hàng ${order._id}`);
      }
      return res.json({ success: true, order, sandbox: true });
    }

    // Gọi refund thật (production)
    const refundResult = await VNPayService.refund({
      vnp_TxnRef: order.vnp_TxnRef,
      vnp_Amount: order.totalAmount,
      vnp_TransactionNo: order.vnp_TransactionNo,
      vnp_OrderInfo: `Refund for order ${order._id}`,
    });
    console.log('[VNPay Refund Result]', refundResult);
    if (refundResult.vnp_ResponseCode === '00') {
      order.paymentStatus = 'Refunded';
      await order.save();
      // Lấy email user và FAKE gửi email
      const user = await User.findById(order.userId);
      if (user && user.email) {
        console.log(`[FAKE EMAIL] Đã gửi email hoàn tiền tới ${user.email} cho đơn hàng ${order._id}`);
      }
      return res.json({ success: true, order });
    } else {
      return res.status(400).json({ success: false, message: 'Refund failed', refundResult });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate({
        path: "items.productId",
        model: "Product",
        select: "product_name imageurl",
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error(
      "=== [PACEUPSHOP][BE] Lỗi khi lấy đơn hàng của người dùng:",
      err
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

// ... (các đoạn mã hiện tại giữ nguyên)

exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const orders = await Order.find({ "items.seller_id": sellerId })
      .populate("userId items.productId")
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian giảm dần
    res.json({ success: true, orders });
  } catch (err) {
    console.error("=== [PACEUPSHOP][BE] Lỗi khi lấy đơn hàng của seller:", err);
    res.status(500).json({ message: err.message });
  }
};

// Thêm endpoint để lấy chi tiết đơn hàng của seller
exports.getSellerOrderDetails = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const order = await Order.findOne({
      _id: req.params.id,
      "items.seller_id": sellerId,
    }).populate("userId items.productId");
    if (!order) {
      console.error(
        "=== [PACEUPSHOP][BE] Order không tìm thấy hoặc không thuộc seller:",
        req.params.id
      );
      return res
        .status(404)
        .json({ message: "Order not found or not owned by seller" });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error(
      "=== [PACEUPSHOP][BE] Lỗi khi lấy chi tiết đơn hàng của seller:",
      err
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

// Thêm endpoint để cập nhật trạng thái đơn hàng (cho seller)
exports.updateOrderStatusBySeller = async (req, res) => {
  try {
    const { status } = req.body;
    const sellerId = req.user._id;
    const validTransitions = {
      Pending: ["Shipping", "Cancelled", "Delivered"],
      Shipping: ["Delivered", "Cancelled"],
      Delivered: [],
      Cancelled: [],
    };
    const order = await Order.findOne({
      _id: req.params.id,
      "items.seller_id": sellerId,
    });
    if (!order) {
      console.error(
        "=== [PACEUPSHOP][BE] Order không tìm thấy hoặc không thuộc seller:",
        req.params.id
      );
      return res
        .status(404)
        .json({ message: "Order not found or not owned by seller" });
    }

    if (!validTransitions[order.orderStatus].includes(status)) {
      console.error(
        `=== [PACEUPSHOP][BE] Chuyển trạng thái không hợp lệ từ ${order.orderStatus} sang ${status}`
      );
      return res.status(400).json({
        message: `Invalid transition from ${order.orderStatus} to ${status}`,
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status, updatedAt: Date.now() },
      { new: true }
    ).populate("userId items.productId");
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(
      "=== [PACEUPSHOP][BE] Lỗi khi cập nhật trạng thái đơn hàng:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSellerStatistics = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const today = new Date();
    const last7Days = new Date(today.setDate(today.getDate() - 7));

    // Lấy tất cả đơn hàng của seller
    const orders = await Order.find({ "items.seller_id": sellerId })
      .populate("items.productId")
      .lean();

    // Tính toán thống kê
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalProductsSold = 0;
    const revenueByDay = {};

    orders.forEach((order) => {
      if (order.orderStatus === "Delivered") {
        totalOrders += 1;
        order.items.forEach((item) => {
          if (item.seller_id.toString() === sellerId.toString()) {
            totalRevenue += item.price * item.quantity;
            totalProductsSold += item.quantity;

            // Tính doanh thu theo ngày (7 ngày gần nhất)
            const orderDate = new Date(order.createdAt);
            if (orderDate >= last7Days) {
              const dateStr = orderDate.toISOString().split("T")[0];
              revenueByDay[dateStr] =
                (revenueByDay[dateStr] || 0) + item.price * item.quantity;
            }
          }
        });
      }
    });

    // Chuyển đổi dữ liệu cho biểu đồ (nếu cần)
    const chartData = {
      labels: Object.keys(revenueByDay),
      data: Object.values(revenueByDay),
    };

    res.json({
      success: true,
      statistics: {
        totalRevenue,
        totalOrders,
        totalProductsSold,
        revenueByDay: chartData,
      },
    });
  } catch (err) {
    console.error("=== [PACEUPSHOP][BE] Lỗi khi lấy thống kê seller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAdminStatistics = async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: "Completed" });
    let totalRevenue = 0;
    let totalOrders = orders.length;
    orders.forEach((order) => {
      totalRevenue += order.totalAmount;
    });
    res.json({ success: true, totalRevenue, totalOrders });
  } catch (err) {
    console.error("=== [PACEUPSHOP][BE] Lỗi khi lấy thống kê admin:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.cancelProductInOrder = async (req, res) => {
  try {
    const { orderId, productId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      console.error("=== [PACEUPSHOP][BE] Order không tìm thấy:", orderId);
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (["Delivered", "Cancelled"].includes(order.orderStatus)) {
      console.error(
        `=== [PACEUPSHOP][BE] Không thể hủy sản phẩm từ đơn hàng ở trạng thái ${order.orderStatus}`
      );
      return res.status(400).json({
        success: false,
        message: `Không thể hủy sản phẩm từ đơn hàng ở trạng thái ${order.orderStatus}`,
      });
    }

    const itemToCancel = order.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!itemToCancel) {
      console.error(
        "=== [PACEUPSHOP][BE] Sản phẩm không có trong đơn hàng:",
        productId
      );
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không có trong đơn hàng" });
    }

    await Product.findByIdAndUpdate(productId, {
      $inc: { quantity: itemToCancel.quantity },
    });

    order.items = order.items.filter(
      (item) => item.productId.toString() !== productId
    );
    order.totalAmount = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (order.items.length === 0) {
      order.orderStatus = "Cancelled";
    }

    await order.save();
    console.log(
      "=== [PACEUPSHOP][BE] Đã hủy sản phẩm khỏi đơn hàng:",
      orderId,
      productId
    );
    res.json({
      success: true,
      message: "Đã hủy sản phẩm khỏi đơn hàng",
      order,
    });
  } catch (err) {
    console.error(
      "=== [PACEUPSHOP][BE] Lỗi khi hủy sản phẩm trong đơn hàng:",
      err
    );
    res.status(500).json({ message: err.message });
  }
};

exports.addProductToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity, price } = req.body;
    const sellerId = req.user._id;

    const order = await Order.findOne({ _id: id, "items.seller_id": sellerId });
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or not owned by seller" });
    }

    if (order.orderStatus !== "Pending" && order.orderStatus !== "Shipping") {
      return res
        .status(400)
        .json({ message: "Cannot add product to order at this stage" });
    }

    const product = await Product.findById(productId);
    if (!product || product.seller_id.toString() !== sellerId.toString()) {
      return res
        .status(400)
        .json({ message: "Invalid product or not owned by seller" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient product quantity" });
    }

    order.items.push({ productId, quantity, price, seller_id: sellerId });
    order.totalAmount += price * quantity;
    await product.updateOne({ $inc: { quantity: -quantity } });
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error(
      "=== [PACEUPSHOP][BE] Lỗi khi thêm sản phẩm vào đơn hàng:",
      err
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelOrderBySeller = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const order = await Order.findOne({ _id: id, "items.seller_id": sellerId });
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or not owned by seller" });
    }

    if (order.orderStatus !== "Pending" && order.orderStatus !== "Shipping") {
      return res
        .status(400)
        .json({ message: "Cannot cancel order at this stage" });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: item.quantity },
      });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("=== [PACEUPSHOP][BE] Lỗi khi hủy đơn hàng bởi seller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Xác nhận đã nhận hàng (customer chuyển trạng thái từ Shipped sang Delivered)
exports.confirmOrderReceived = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found or not owned by customer" });
    }
    if (order.orderStatus !== "Shipping") {
      return res.status(400).json({ message: "Order is not in 'Shipping' status" });
    }
    order.orderStatus = "Delivered";
    order.updatedAt = Date.now();
    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("=== [PACEUPSHOP][BE] Lỗi khi xác nhận đã nhận hàng:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.sendRefundEmailAgain = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentStatus !== 'Refunded') {
      return res.status(400).json({ success: false, message: 'Order chưa hoàn tiền' });
    }
    const user = await User.findById(order.userId);
    if (user && user.email) {
      await sendRefundEmail(user.email, order._id);
      return res.json({ success: true });
    }
    res.status(400).json({ success: false, message: 'Không tìm thấy email user' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Thêm API xác nhận đã thu tiền cho đơn hàng COD
exports.confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const orderDoc = await Order.findById(id);
    if (!orderDoc) return res.status(404).json({ message: "Order not found" });

    // Chỉ cho phép xác nhận khi đã giao hàng (Delivered) và chưa thanh toán
    if (orderDoc.orderStatus !== "Delivered" || orderDoc.paymentStatus !== "Pending") {
      return res.status(400).json({ message: "Order must be Delivered and payment pending to confirm payment" });
    }

    orderDoc.paymentStatus = "Completed";
    await orderDoc.save();
    res.json({ message: "Payment confirmed", order: orderDoc });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// PUT /api/orders/:orderId/status
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { newStatus } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.orderStatus = newStatus;
    await order.save();

    res.status(200).json({ message: "Cập nhật trạng thái thành công", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};


