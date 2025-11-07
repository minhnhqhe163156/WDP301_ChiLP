const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/Order");

class ZaloPayService {
  async createPayment(order) {
    console.log("[DEBUG][ZaloPay][createPayment] order._id:", order._id);
    const config = {
      app_id: process.env.ZALOPAY_APP_ID || "2553",
      key1: process.env.ZALOPAY_KEY1 || "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
      key2: process.env.ZALOPAY_KEY2 || "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
      endpoint:
        process.env.ZALOPAY_ENDPOINT ||
        "https://sb-openapi.zalopay.vn/v2/create",
    };
    console.log("=== [PACEUPSHOP][BE] ZaloPay createPayment config:", {
      app_id: config.app_id,
      endpoint: config.endpoint,
    });

    const transID = Math.floor(Math.random() * 1000000);
    const params = {
      app_id: config.app_id,
      app_trans_id: `${new Date()
        .toISOString()
        .slice(2, 10)
        .replace(/-/g, "")}_${transID}`,
      app_user: order.userId.toString(),
      app_time: Date.now(),
      amount: order.totalAmount,
      item: JSON.stringify(order.items),
      embed_data: JSON.stringify({
        orderId: order._id,
        redirecturl: "https://localhost:5173/checkout/success",
      }),
      description: `Payment for order #${order._id}`,
      bank_code: "",
      callback_url:
        process.env.ZALOPAY_CALLBACK_URL ||
        "https://639b-42-114-213-61.ngrok-free.app/api/orders/zalopay-callback",
    };
    console.log("[DEBUG][ZaloPay][createPayment] params:", params);

    const data = `${params.app_id}|${params.app_trans_id}|${params.app_user}|${params.amount}|${params.app_time}|${params.embed_data}|${params.item}`;
    params.mac = crypto
      .createHmac("sha256", config.key1)
      .update(data)
      .digest("hex");
    console.log("=== [PACEUPSHOP][BE] ZaloPay createPayment MAC:", params.mac);

    try {
      const { data: response } = await axios.post(config.endpoint, null, {
        params,
      });
      console.log("[DEBUG][ZaloPay][createPayment] ZaloPay API response:", response);

      if (response.return_code === 1) {
        return response.order_url;
      }
      throw new Error(
        `ZaloPay API error: ${response.return_message || "Unknown error"}`
      );
    } catch (error) {
      console.error(
        "=== [PACEUPSHOP][BE] ZaloPay createPayment error:",
        error.message,
        error.stack
      );
      throw error;
    }
  }

  async verifyCallback(data) {
    console.log("[DEBUG][ZaloPay][verifyCallback] callback body:", data);
    console.log("=== [PACEUPSHOP][BE] [ZaloPay] Bắt đầu verifyCallback ===");
    console.log("[ZaloPay] Dữ liệu nhận được:", JSON.stringify(data, null, 2));

    // Kiểm tra định dạng dữ liệu
    if (!data || !data.data || !data.mac) {
      console.error("[ZaloPay] Dữ liệu callback không hợp lệ:", data);
      throw new Error("Invalid callback data format: missing data or mac");
    }

    const config = {
      key2: process.env.ZALOPAY_KEY2 || "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    };
    console.log("[ZaloPay] Sử dụng key2:", config.key2.substring(0, 8) + "...");

    let dataJson;
    try {
      dataJson = JSON.parse(data.data);
      console.log("[DEBUG][ZaloPay][verifyCallback] dataJson:", dataJson);
      console.log("[DEBUG][ZaloPay][verifyCallback] dataJson.embed_data:", dataJson.embed_data);
    } catch (error) {
      console.error("[ZaloPay] Lỗi parse data:", error.message);
      throw new Error("Failed to parse callback data");
    }

    // Kiểm tra các trường bắt buộc trong dataJson
    if (
      !dataJson.app_id ||
      !dataJson.app_trans_id ||
      !dataJson.amount ||
      !dataJson.embed_data
    ) {
      console.error(
        "[ZaloPay] Thiếu trường bắt buộc trong dataJson:",
        dataJson
      );
      throw new Error("Missing required fields in callback data");
    }

    const expectedMac = crypto
      .createHmac("sha256", config.key2)
      .update(data.data)
      .digest("hex");
    console.log("[ZaloPay] MAC mong đợi:", expectedMac);
    console.log("[ZaloPay] MAC nhận được:", data.mac);

    if (expectedMac !== data.mac) {
      console.error("[ZaloPay] MAC không khớp:", {
        expectedMac,
        receivedMac: data.mac,
      });
      throw new Error("Invalid MAC");
    }

    let embedData;
    try {
      embedData = JSON.parse(dataJson.embed_data);
      console.log("[DEBUG][ZaloPay][verifyCallback] embedData:", embedData);
      console.log("[DEBUG][ZaloPay][verifyCallback] orderId trong embedData:", embedData.orderId);
    } catch (error) {
      console.error("[ZaloPay] Lỗi parse embed_data:", error.message);
      throw new Error("Failed to parse embed_data");
    }

    // Bổ sung: Lấy và cập nhật trạng thái đơn hàng
    let order = null;
    try {
      console.log("[ZaloPay] Tìm đơn hàng với orderId:", embedData.orderId);
      order = await Order.findById(embedData.orderId);
      if (!order) {
        console.error("[ZaloPay] Không tìm thấy đơn hàng:", embedData.orderId);
        return {
          isSuccess: false,
          errorMessage: "Order not found",
        };
      }
      // Kiểm tra số tiền
      if (dataJson.amount !== order.totalAmount) {
        console.error("[ZaloPay] Số tiền không khớp:", {
          expected: order.totalAmount,
          received: dataJson.amount,
        });
        return {
          isSuccess: false,
          errorMessage: "Amount mismatch",
        };
      }
      // Cập nhật trạng thái đơn hàng nếu chưa completed
      if (order.paymentStatus !== "Completed") {
        order.paymentStatus = "Completed";
        order.orderStatus = "Processing";
        order.transactionId = dataJson.app_trans_id;
        await order.save();
        console.log(
          "[ZaloPay] Đã cập nhật trạng thái đơn hàng thành công:",
          order._id
        );
      } else {
        console.log("[ZaloPay] Đơn hàng đã thanh toán trước đó:", order._id);
      }
    } catch (err) {
      console.error("[ZaloPay] Lỗi khi cập nhật đơn hàng:", err.message);
      return {
        isSuccess: false,
        errorMessage: err.message,
      };
    }

    console.log(
      "[ZaloPay] verifyCallback thành công cho order:",
      embedData.orderId
    );
    return {
      isSuccess: data.type === 1,
      orderId: embedData.orderId,
      transactionId: dataJson.app_trans_id,
      amount: dataJson.amount,
      redirecturl: embedData.redirecturl || null,
    };
  }
}

module.exports = new ZaloPayService();
