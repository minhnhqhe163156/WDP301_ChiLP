import api from "./api";

// Lấy danh sách sản phẩm
export const fetchProducts = () => api.get("/products");

// Lấy chi tiết sản phẩm theo ID
export const fetchProductById = (id) => api.get(`/products/${id}`);

// Thêm sản phẩm mới (FormData)
export const addProduct = (formData) => api.post("/products", formData);

// Cập nhật sản phẩm theo ID (FormData)
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProduct = (id) => api.delete(`/products/${id}`);
