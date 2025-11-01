import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit3,
  Plus,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Truck,
  Users,
  Briefcase,
  BarChart2,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { fetchProducts } from "../../../api/productApi";
import { getAllCategories } from "../../../api/categoryApi";
import { useNavigate } from "react-router-dom";
import { deleteProduct } from "../../../api/productApi";
const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState({ field: "", order: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [productDetail, setProductDetail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  // Fetch products & categories
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProducts(), getAllCategories()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Unique brands
  const uniqueBrands = [
    ...new Set(products.map((p) => p.brand).filter(Boolean)),
  ];

  // Filter, search, sort
  let filtered = [...products];
  if (searchTerm) {
    filtered = filtered.filter((p) =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  if (categoryFilter) {
    filtered = filtered.filter((p) => {
      if (Array.isArray(p.category_id))
        return p.category_id.some((cat) => (cat._id || cat) === categoryFilter);
      return (p.category_id?._id || p.category_id) === categoryFilter;
    });
  }
  if (brandFilter) {
    filtered = filtered.filter((p) => p.brand === brandFilter);
  }
  if (statusFilter) {
    if (statusFilter === "inStock")
      filtered = filtered.filter((p) => (p.quantity || 0) > 0);
    else if (statusFilter === "outStock")
      filtered = filtered.filter((p) => (p.quantity || 0) === 0);
  }
  if (sortBy.field) {
    filtered.sort((a, b) => {
      let aVal = a[sortBy.field];
      let bVal = b[sortBy.field];
      if (sortBy.field === "product_name") {
        aVal = aVal?.toLowerCase() || "";
        bVal = bVal?.toLowerCase() || "";
      }
      if (sortBy.order === "asc") return aVal > bVal ? 1 : -1;
      if (sortBy.order === "desc") return aVal < bVal ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helpers
  const getImageUrl = (product) => {
    return (
      (Array.isArray(product.imageUrls) && product.imageUrls[0]) ||
      (Array.isArray(product.imageurl) && product.imageurl[0]) ||
      (typeof product.imageurl === "string" && product.imageurl) ||
      "https://via.placeholder.com/80x80?text=No+Image"
    );
  };
  const getCategoryName = (product) => {
    if (Array.isArray(product.category_id))
      return product.category_id.map((cat) => cat.name).join(", ");
    return product.category_id?.name || "-";
  };

  // Sort handler
  const handleSort = (field) => {
    setSortBy((prev) => {
      if (prev.field === field) {
        if (prev.order === "asc") return { field, order: "desc" };
        if (prev.order === "desc") return { field: "", order: "" };
        return { field, order: "asc" };
      }
      return { field, order: "asc" };
    });
  };

  // Delete modal logic
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    setProductToDelete(null);
    setShowDeleteModal(false);
  };
  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete._id);
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch {
      alert("Xóa sản phẩm thất bại!");
    }
  };

  // Detail modal logic
  const openDetailModal = (product) => {
    setProductDetail(product);
    setShowDetailModal(true);
  };
  const closeDetailModal = () => {
    setProductDetail(null);
    setShowDetailModal(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-indigo-600 to-purple-600 text-white min-h-screen p-6">
        <div className="flex items-center gap-2 mb-8">
          <Briefcase size={24} />
          <span className="font-bold text-lg">Bảng điều khiển</span>
        </div>
        <nav className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/seller/analytics")}
            className="flex items-center gap-2 hover:underline"
          >
            <BarChart2 size={20} /> Phân Tích cửa hàng
          </button>
          <button
            onClick={() => navigate("/seller/order-management")}
            className="flex items-center gap-2 hover:underline"
          >
            <Truck size={20} /> Quản Lí Đơn hàng
          </button>
          <button
            onClick={() => navigate("/seller/reviews")}
            className="flex items-center gap-2 hover:underline"
          >
            <Users size={20} /> Quản Lí Feedback
          </button>
          <button
            onClick={() => navigate("/seller/products")}
            className="flex items-center gap-2 font-semibold underline"
          >
            <PlusCircle size={20} /> Quản Lí Sản Phẩm
          </button>
        </nav>
      </aside>

      {/* Content */}
      <div className="p-6 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h2>
          <button
            onClick={() => navigate("/seller/products/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <PlusCircle size={18} /> Thêm sản phẩm
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              className="border px-3 py-2 rounded w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border px-3 py-2 rounded"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">-- Tất cả danh mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            className="border px-3 py-2 rounded"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">-- Tất cả thương hiệu --</option>
            {uniqueBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <select
            className="border px-3 py-2 rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="inStock">Còn hàng</option>
            <option value="outStock">Hết hàng</option>
          </select>
        </div>

        {/* Danh sách sản phẩm */}
        {loading ? (
          <p className="text-center text-gray-500 italic">
            Đang tải sản phẩm...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            Không có sản phẩm nào.
          </p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm text-left border">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("product_name")}
                  >
                    Tên sản phẩm{" "}
                    {sortBy.field === "product_name" &&
                      (sortBy.order === "asc"
                        ? "▲"
                        : sortBy.order === "desc"
                          ? "▼"
                          : "")}
                  </th>
                  <th className="px-4 py-3">Ảnh</th>
                  <th
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("category_id")}
                  >
                    Danh mục
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("brand")}
                  >
                    Thương hiệu{" "}
                    {sortBy.field === "brand" &&
                      (sortBy.order === "asc"
                        ? "▲"
                        : sortBy.order === "desc"
                          ? "▼"
                          : "")}
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    Giá{" "}
                    {sortBy.field === "price" &&
                      (sortBy.order === "asc"
                        ? "▲"
                        : sortBy.order === "desc"
                          ? "▼"
                          : "")}
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("quantity")}
                  >
                    Kho{" "}
                    {sortBy.field === "quantity" &&
                      (sortBy.order === "asc"
                        ? "▲"
                        : sortBy.order === "desc"
                          ? "▼"
                          : "")}
                  </th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td
                      className="px-4 py-2 font-medium text-blue-600 hover:underline cursor-pointer"
                      onClick={() => openDetailModal(product)}
                    >
                      {product.product_name}
                    </td>
                    <td className="px-4 py-2">
                      <img
                        src={getImageUrl(product)}
                        alt="ảnh sản phẩm"
                        className="w-16 h-16 object-cover rounded border"
                      />
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {getCategoryName(product)}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {product.brand || "-"}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {(product.price || 0).toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {product.quantity || 0}
                    </td>
                    <td className="px-4 py-2">
                      {(product.quantity || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                          <CheckCircle size={16} /> Còn hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                          <XCircle size={16} /> Hết hàng
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openDetailModal(product)}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                        >
                          <Eye size={14} /> Xem
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/seller/products/edit/${product._id}`)
                          }
                          className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                        >
                          <Edit3 size={14} /> Sửa
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                        <button
                          onClick={() => alert("Tính năng tăng kho sắp ra mắt")}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                        >
                          <Plus size={14} /> Kho
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex justify-center items-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === page ? "bg-indigo-600 text-white" : ""
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Modal xác nhận xóa */}
        {showDeleteModal && productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-2 text-red-600">
                Xác nhận xóa sản phẩm
              </h3>
              <p className="mb-4">
                Bạn có chắc chắn muốn xóa sản phẩm{" "}
                <span className="font-semibold">
                  {productToDelete.product_name}
                </span>{" "}
                không?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal xem chi tiết sản phẩm */}
        {showDetailModal && productDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button
                onClick={closeDetailModal}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              >
                <XCircle size={22} />
              </button>
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={getImageUrl(productDetail)}
                  alt={productDetail.product_name}
                  className="w-40 h-40 object-cover rounded border"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-indigo-700">
                    {productDetail.product_name}
                  </h3>
                  <p className="mb-1">
                    Danh mục:{" "}
                    <span className="font-semibold">
                      {getCategoryName(productDetail)}
                    </span>
                  </p>
                  <p className="mb-1">
                    Thương hiệu:{" "}
                    <span className="font-semibold">
                      {productDetail.brand || "-"}
                    </span>
                  </p>
                  <p className="mb-1">
                    Giá:{" "}
                    <span className="font-semibold">
                      {(productDetail.price || 0).toLocaleString("vi-VN")} ₫
                    </span>
                  </p>
                  <p className="mb-1">
                    Kho:{" "}
                    <span className="font-semibold">
                      {productDetail.quantity || 0}
                    </span>
                  </p>
                  <p className="mb-1">
                    Trạng thái:{" "}
                    {productDetail.quantity > 0 ? (
                      <span className="text-green-600 font-semibold">
                        Còn hàng
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        Hết hàng
                      </span>
                    )}
                  </p>
                  <p className="mb-1">
                    Mô tả:{" "}
                    <span className="text-gray-700">
                      {productDetail.description || "-"}
                    </span>
                  </p>
                  {/* Thêm các trường khác nếu muốn */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;
