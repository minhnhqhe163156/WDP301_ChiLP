import axios from "../configs/axiosCustomize";

// Lấy danh sách notification (có phân trang)
export const fetchNotifications = (params = {}) =>
  axios.get("/api/notifications", { params });

// Đánh dấu đã đọc
export const markAsRead = (id) =>
  axios.put(`/api/notifications/${id}/read`);

// Đánh dấu tất cả đã đọc
export const markAllAsRead = () =>
  axios.put("/api/notifications/read-all");

// Xóa notification
export const deleteNotification = (id) =>
  axios.delete(`/api/notifications/${id}`); 