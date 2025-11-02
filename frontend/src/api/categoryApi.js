import axios from "axios";
import api from "./api";

export const getAllCategories = () => api.get("/categories");
export const createCategory = (data) => axios.post("/api/categories", data);
export const deleteCategory = (id) => axios.delete(`/api/categories/${id}`);
export const updateCategory = (id, data) => axios.put(`/api/categories/${id}`, data);
