import api from "./api";

// Lấy danh sách tất cả user (admin)
export const fetchUsers = () => api.get("/admin/users");
export const updateUserStatus = (userId, isActive) =>
  api.patch(`/admin/users/${userId}/status`, { is_active: isActive });
export const changeOwnPassword = (oldPassword, newPassword) =>
  api.patch("/admin/change-password", { oldPassword, newPassword });
export const getRevenueStats = (type) =>
  api.get("/admin/statistics/revenue", { params: { type } });
export const getOrderStats = (type = "month") =>
  api.get("/admin/statistics/orders", { params: { type } });
export const getCategoryStats = () =>
  api.get("/admin/statistics/category");
export const updateUserRole = (userId, role) =>   
  api.patch(`/admin/users/${userId}/role`, { role });