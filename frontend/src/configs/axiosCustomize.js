// src/configs/axiosCustomize.js
import axios from "axios";

const axiosCustomize = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Thêm token vào header nếu cần
axiosCustomize.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Xử lý response và lỗi
axiosCustomize.interceptors.response.use(
  (response) => {
    // Trả về response.data để đơn giản hóa việc sử dụng trong component
    return response.data;
  },
  async (error) => {
    const { response } = error;

    if (response) {
      // Xử lý các mã lỗi cụ thể
      switch (response.status) {
        case 401:
          console.error(
            "Token hết hạn hoặc không hợp lệ. Redirecting to login..."
          );
          window.location.href = "/auth";
          break;
        case 500:
          console.warn("Server error:", response.data);
          break;
        default:
          // Xử lý các lỗi khác (400, 403, v.v.)
          console.error(`API error: ${response.status}`, response.data);
      }

      // Ném lỗi với thông báo chi tiết
      const message = response.data?.message || `API error: ${response.status}`;
      return Promise.reject(new Error(message));
    }

    // Lỗi không có response (như mất mạng)
    return Promise.reject(new Error("Network error"));
  }
);

export default axiosCustomize;
