import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProducts } from "../../../api/productApi";

const ProductDetailSeller = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetchProducts();
        const found = res.data?.find((item) => item._id === id);
        setProduct(found);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
      }
    };
    loadProduct();
  }, [id]);

  if (!product) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Đang tải thông tin sản phẩm...
      </p>
    );
  }

  const imageUrl =
    (Array.isArray(product.imageurl) && product.imageurl[0]) ||
    (Array.isArray(product.imageUrls) && product.imageUrls[0]) ||
    (typeof product.imageurl === "string" && product.imageurl) ||
    "https://via.placeholder.com/400x400?text=No+Image";

  // Xử lý category (có thể là 1 hoặc nhiều)
  const categories = Array.isArray(product.category_id)
    ? product.category_id
    : product.category_id
      ? [product.category_id]
      : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Quay lại
      </button>

      <div className="bg-white p-6 rounded shadow-md">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <img
              src={imageUrl}
              alt={product.product_name}
              className="w-full h-72 object-cover rounded"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {product.product_name}
              {product.is_featured && (
                <span className="ml-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded">
                  Nổi bật
                </span>
              )}
            </h2>

            {/* Hiển thị các category dưới dạng badge */}
            <div className="mb-2 flex flex-wrap gap-2">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <button
                    key={cat._id || cat}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition"
                    onClick={() =>
                      navigate(
                        `/seller/categories?categoryId=${cat._id || cat}`
                      )
                    }
                  >
                    {cat.name || cat}
                  </button>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Không có danh mục</span>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-1">
              Thương hiệu: {product.brand || "-"}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Màu sắc: {product.color || "-"}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Kích cỡ:{" "}
              {Array.isArray(product.size) ? product.size.join(", ") : "-"}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Tình trạng: {product.status}
            </p>

            <div className="mt-3">
              <p className="text-lg text-gray-800 font-semibold">
                Giá: {(product.price || 0).toLocaleString("vi-VN")} ₫
              </p>
              {product.discount_price &&
                product.discount_price < product.price && (
                  <p className="text-green-600 font-semibold">
                    Khuyến mãi: {product.discount_price.toLocaleString("vi-VN")}{" "}
                    ₫
                  </p>
                )}
              <p className="text-gray-700 text-sm mt-1">
                Số lượng kho: {product.quantity}
              </p>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              <p>
                Đánh giá: ⭐ {product.averageRating || 0} (
                {product.totalReviews || 0} đánh giá)
              </p>
              <p>
                Tags:{" "}
                {Array.isArray(product.tags) ? product.tags.join(", ") : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Mô tả sản phẩm:
          </h3>
          <p className="text-gray-700 text-sm mt-1">
            {product.description || "Không có mô tả"}
          </p>
        </div>

        {product.specifications &&
          Object.keys(product.specifications).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Thông số kỹ thuật:
              </h3>
              <ul className="list-disc ml-6 mt-2 text-sm text-gray-700">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
};

export default ProductDetailSeller;
