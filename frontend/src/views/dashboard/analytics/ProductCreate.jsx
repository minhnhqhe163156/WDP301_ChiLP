import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../../../api/productApi";
import { getAllCategories } from "../../../api/categoryApi";
import { toast } from "react-toastify";

const brands = ["Nike", "Adidas", "Puma", "Gucci", "H&M", "Zara", "Other"];

const ProductCreate = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    product_name: "",
    price: "",
    quantity: "",
    brand: "",
    description: "",
    category_id: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        setCategories(res.data);
      } catch (err) {
        toast.error("Không thể tải danh mục.");
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchCategories();
  }, []);

  // Validate từng trường
  const validate = (field, value) => {
    switch (field) {
      case "product_name":
        if (!value) return "Tên sản phẩm là bắt buộc.";
        if (value.length < 3) return "Tên sản phẩm phải từ 3 ký tự.";
        return "";
      case "price":
        if (!value) return "Giá là bắt buộc.";
        if (isNaN(value) || Number(value) <= 0) return "Giá phải là số dương.";
        return "";
      case "quantity":
        if (!value) return "Số lượng là bắt buộc.";
        if (!Number.isInteger(Number(value)) || Number(value) < 0)
          return "Số lượng phải là số nguyên không âm.";
        return "";
      case "brand":
        if (!value) return "Thương hiệu là bắt buộc.";
        return "";
      case "category_id":
        if (!value) return "Danh mục là bắt buộc.";
        return "";
      case "description":
        if (value.length > 500) return "Mô tả tối đa 500 ký tự.";
        return "";
      default:
        return "";
    }
  };

  // Validate toàn bộ form
  const validateAll = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, val]) => {
      const err = validate(key, val);
      if (err) newErrors[key] = err;
    });
    // Validate ảnh
    if (images.length === 0) newErrors.images = "Cần chọn ít nhất 1 ảnh.";
    else if (images.some((file) => !file.type.startsWith("image/")))
      newErrors.images = "Chỉ chấp nhận file ảnh.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreview(files.map((file) => URL.createObjectURL(file)));
    // Validate ảnh
    if (files.length === 0)
      setErrors((prev) => ({ ...prev, images: "Cần chọn ít nhất 1 ảnh." }));
    else if (files.some((file) => !file.type.startsWith("image/")))
      setErrors((prev) => ({ ...prev, images: "Chỉ chấp nhận file ảnh." }));
    else setErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setImages(files);
    setImagePreview(files.map((file) => URL.createObjectURL(file)));
    // Validate ảnh
    if (files.length === 0)
      setErrors((prev) => ({ ...prev, images: "Cần chọn ít nhất 1 ảnh." }));
    else if (files.some((file) => !file.type.startsWith("image/")))
      setErrors((prev) => ({ ...prev, images: "Chỉ chấp nhận file ảnh." }));
    else setErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error("Vui lòng kiểm tra lại các trường dữ liệu.");
      return;
    }
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      images.forEach((file) => data.append("images", file));
      await addProduct(data);
      toast.success("Thêm sản phẩm thành công!");
      navigate("/seller/products");
    } catch (err) {
      console.error("Lỗi thêm sản phẩm:", err);
      toast.error("Thêm sản phẩm thất bại.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Thêm sản phẩm mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Tên sản phẩm *"
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
          error={errors.product_name}
        />
        <InputField
          label="Giá (VNĐ) *"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
        />
        <InputField
          label="Số lượng *"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          error={errors.quantity}
        />
        {/* Brand select */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Thương hiệu *
          </label>
          <select
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">-- Chọn thương hiệu --</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {errors.brand && (
            <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
          )}
        </div>
        {/* Category select */}
        <div>
          <label className="block text-sm font-medium mb-1">Danh mục *</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
          )}
        </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border px-3 py-2 rounded"
            maxLength={500}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>
        {/* Drag & Drop */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`w-full border-2 border-dashed px-4 py-6 text-center rounded hover:bg-gray-50 ${errors.images ? "border-red-400 text-red-500" : "border-gray-300 text-gray-500"}`}
        >
          <p>Kéo thả ảnh vào đây hoặc</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="mt-2"
          />
          {errors.images && (
            <p className="text-red-500 text-sm mt-1">{errors.images}</p>
          )}
        </div>
        {/* Preview images */}
        {imagePreview.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {imagePreview.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`preview-${idx}`}
                className="w-24 h-24 object-cover border rounded"
              />
            ))}
          </div>
        )}
        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={Object.values(errors).some((err) => err)}
          >
            Thêm sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable input field
const InputField = ({ label, name, value, onChange, type = "text", error }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border px-3 py-2 rounded ${error ? "border-red-400" : ""}`}
      required
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default ProductCreate;
