import axios from "./api"; // hoặc đường dẫn tới axios instance của bạn

// Lấy lịch sử đơn hàng cho customer
export const getMyOrders = () => axios.get("/orders/my-orders");

// Lấy danh sách đơn hàng cho seller
export const getSellerOrders = () => axios.get("/orders/seller-orders");

// Thống kê doanh số cho seller
export const getSellerStatistics = () => axios.get("/orders/seller-statistics");

// Thống kê doanh số cho admin
export const getAdminStatistics = () => axios.get("/orders/admin-statistics");

// Hủy sản phẩm khỏi đơn hàng đã thanh toán
export const cancelProductInOrder = (orderId, productId) =>
  axios.post("/orders/cancel-product", { orderId, productId });

// Xác nhận thanh toán
export const confirmPayment = (apptransid, amount, paymentMethod) =>
  axios.post("/orders/confirm-payment", { apptransid, amount, paymentMethod });

// Tạo đơn hàng mới
export const createOrder = (orderData) => axios.post("/orders", orderData);

// Lấy thông tin đơn hàng theo ID
export const getOrder = (orderId) => axios.get(`/orders/${orderId}`);

// Lấy chi tiết đơn hàng theo ID
export const getOrderDetail = (orderId) => axios.get(`/orders/${orderId}`);

// API dành riêng cho seller

// Cập nhật trạng thái đơn hàng cho seller
export const updateOrderStatusBySeller = (orderId, status) =>
  axios.patch(`/orders/seller/${orderId}/status`, { status });

// Cập nhật trạng thái đơn hàng cho admin
export const updateOrderStatusByAdmin = (orderId, status) =>
  axios.patch(`/orders/${orderId}/status`, { status });

// Lấy chi tiết đơn hàng theo ID (dành cho seller)
export const getSellerOrderDetails = (orderId) =>
  axios.get(`/orders/seller/${orderId}`);

// Xác nhận hủy đơn hàng (dành cho seller khi khách yêu cầu hủy)
export const confirmOrderCancellation = (orderId) =>
  axios.post(`/orders/${orderId}/cancel`);

// Thêm sản phẩm mới vào đơn hàng hiện có (nếu cần)
export const addProductToOrder = (orderId, productData) =>
  axios.post(`/orders/${orderId}/add-product`, productData);

// Refund đơn hàng (customer chủ động yêu cầu hoàn tiền)
export const refundOrder = (orderId) =>
  axios.patch(`/orders/${orderId}/refund`);

// Gửi lại email hoàn tiền
export const resendRefundEmail = (orderId) =>
  axios.post(`/orders/${orderId}/send-refund-email`);
