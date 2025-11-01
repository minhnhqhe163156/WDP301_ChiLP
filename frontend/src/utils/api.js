import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await api.post("/auth/refresh-token");
        const { token } = response.data;

        // Update the token
        localStorage.setItem("token", token);

        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, logout the user
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  // Get token from localStorage
  const token = localStorage.getItem("token"); // Changed from 'accesstoken' to match your auth system
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - redirect to login
      window.location.href = "/loginandregister";
    }
    return Promise.reject(error);
  }
);

// Marketing API endpoints
export const marketingApi = {
  // Banners
  getBanners: () => api.get("/api/marketing/banners"),
  createBanner: (formData) =>
    api.post("/api/marketing/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateBanner: (id, formData) =>
    api.put(`/api/marketing/banners/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteBanner: (id) => api.delete(`/api/marketing/banners/${id}`),

  // Blogs
  getBlogs: () => api.get("/api/marketing/blogs"),
  createBlog: (formData) =>
    api.post("/api/marketing/blogs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateBlog: (id, formData) =>
    api.put(`/api/marketing/blogs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteBlog: (id) => api.delete(`/api/marketing/blogs/${id}`),

  // Promotions
  getPromotions: () => api.get("/api/marketing/promotions"),
  createPromotion: (data) => api.post("/api/marketing/promotions", data),
  updatePromotion: (id, data) => api.put(`/api/marketing/promotions/${id}`, data),
  deletePromotion: (id) => api.delete(`/api/marketing/promotions/${id}`),

  // Voucher endpoints
  getVouchers: () => api.get("/api/vouchers"),
  createVoucher: (data) => api.post("/api/vouchers", data),
  updateVoucher: (id, data) => api.put(`/api/vouchers/${id}`, data),
  deleteVoucher: (id) => api.delete(`/api/vouchers/${id}`),
  applyVoucher: (code, orderTotal) => api.post("/api/vouchers/apply", { voucher_code: code, order_total: orderTotal }),

  // Count endpoints
  getUserCount: () => api.get('/api/auth/count'),
  getBlogCount: () => api.get('/api/marketing/blogs/count'),
  getBannerCount: () => api.get('/api/marketing/banners/count'),
  getVoucherCount: () => api.get('/api/vouchers/count'),
  getUserRegistrationStats: (params) => api.get(`/api/auth/registration-stats?${params}`),
  getVoucherUsageStats: (params) => api.get(`/api/vouchers/usage-stats?${params}`),
  getVoucherUsageDetail: () => api.get('/api/vouchers/usage-detail'),

  // Brand endpoints
  getBrands: () => api.get('/api/brands'),
  createBrand: (data) => api.post('/api/brands', data),
  deleteBrand: (id) => api.delete(`/api/brands/${id}`),
};

export default api;
