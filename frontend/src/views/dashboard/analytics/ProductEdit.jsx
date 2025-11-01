import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, updateProduct } from "../../../api/productApi";
import { toast } from "react-toastify";

const brands = ["Nike", "Adidas", "Puma", "Gucci", "H&M", "Zara", "Other"];

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: "",
    price: "",
    quantity: "",
    brand: "",
    description: "",
  });
  const [images, setImages] = useState([]); // file mới
  const [imagePreview, setImagePreview] = useState([]); // preview hiện tại

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data } = await fetchProductById(id);
        setProduct(data);

        setFormData({
          product_name: data.product_name || "",
          price: data.price || "",
          quantity: data.quantity || "",
          brand: data.brand || "",
          description: data.description || "",
        });

        // preview ảnh
        if (Array.isArray(data.imageurl)) {
          setImagePreview(data.imageurl);
        } else if (typeof data.imageurl === "string") {
          setImagePreview([data.imageurl]);
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        toast.error("Không thể tải sản phẩm.");
      }
    };
    loadProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setImagePreview(files.map((file) => URL.createObjectURL(file)));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setImages(files);
    setImagePreview(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.product_name ||
      !formData.price ||
      !formData.quantity ||
      !formData.brand
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      const data = new FormData();

      // Gửi các trường văn bản
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Gửi ảnh (mới nếu có, còn không giữ lại ảnh cũ)
      if (images.length > 0) {
        images.forEach((file) => data.append("images", file));
      } else if (imagePreview.length > 0) {
        imagePreview.forEach((url) => data.append("images", url));
      }

      await updateProduct(id, data);
      toast.success("Cập nhật thành công!");
      navigate("/seller/products");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      toast.error("Cập nhật thất bại.");
    }
  };

  if (!product) {
    return (
      <p className="text-center mt-10 text-gray-500">Đang tải sản phẩm...</p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Chỉnh sửa sản phẩm</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Tên sản phẩm *"
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
        />
        <InputField
          label="Giá (VNĐ) *"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
        />
        <InputField
          label="Số lượng *"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
        />

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
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full border-2 border-dashed border-gray-300 px-4 py-6 text-center text-gray-500 rounded hover:bg-gray-50"
        >
          <p>Kéo thả ảnh vào đây hoặc</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="mt-2"
          />
        </div>

        {/* Ảnh preview */}
        {imagePreview.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {imagePreview.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Ảnh ${i}`}
                className="w-24 h-24 object-cover border rounded"
              />
            ))}
          </div>
        )}

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
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border px-3 py-2 rounded"
      required
    />
  </div>
);

export default ProductEdit;
