import api from "./api";

export const createVoucher = (data) => api.post("/vouchers", data);
export const updateVoucher = (id, data) => api.put(`/vouchers/${id}`, data);
export const getVouchers = () => api.get("/vouchers");
export const validateVoucher = (code, order_total) => 
  api.get(`/vouchers/validate?voucher=${code}${order_total ? `&order_total=${order_total}` : ''}`); 