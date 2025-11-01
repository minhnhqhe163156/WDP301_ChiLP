import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit3, Save, XCircle, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../../api/categoryApi";
import { Briefcase, Truck, Users, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../../api/productApi";

const ProductCategory = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const navigate = useNavigate();

  // Load danh mục
  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
        toast.error("Dữ liệu danh mục không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      toast.error("Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  // Thêm danh mục
  const handleCreate = async () => {
    if (!newCategory.trim()) return;
    const isDuplicate = categories.some(
      (cat) => cat.name.toLowerCase() === newCategory.trim().toLowerCase()
    );
    if (isDuplicate) {
      toast.error("Danh mục đã tồn tại");
      return;
    }
    try {
      setIsCreating(true);
      await createCategory({ name: newCategory });
      toast.success("Thêm danh mục thành công");
      setNewCategory("");
      await loadCategories();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi thêm danh mục");
    } finally {
      setIsCreating(false);
    }
  };

  // Xoá danh mục
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xoá danh mục này?");
    if (!confirmed) return;
    try {
      setIsDeleting(true);
      await deleteCategory(id);
      toast.success("Xoá danh mục thành công");
      await loadCategories();
      if (selectedCategory && selectedCategory._id === id)
        setSelectedCategory(null);
    } catch (err) {
      console.error("Lỗi khi xoá danh mục:", err);
      toast.error("Lỗi khi xoá danh mục");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleUpdate = async (id) => {
    if (!editingName.trim())
      return toast.error("Tên danh mục không được để trống");
    try {
      await updateCategory(id, { name: editingName });
      toast.success("Cập nhật thành công");
      setEditingId(null);
      setEditingName("");
      await loadCategories();
    } catch {
      toast.error("Lỗi khi cập nhật danh mục");
    }
  };
  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  // Load sản phẩm khi chọn category
  useEffect(() => {
    if (selectedCategory) {
      setLoadingProducts(true);
      fetchProducts()
        .then((res) => {
          setProducts(res.data || []);
        })
        .catch(() => setProducts([]))
        .finally(() => setLoadingProducts(false));
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadCategories();
  }, []);

  // Filter danh mục theo search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filter sản phẩm theo search và category
  const filteredProducts = selectedCategory
    ? products.filter((p) => {
        // Kiểm tra sản phẩm thuộc category
        const matchCategory = Array.isArray(p.category_id)
          ? p.category_id.some(
              (cat) => (cat._id || cat) === selectedCategory._id
            )
          : (p.category_id?._id || p.category_id) === selectedCategory._id;
        // Kiểm tra search
        const matchSearch = p.product_name
          .toLowerCase()
          .includes(productSearch.toLowerCase());
        return matchCategory && matchSearch;
      })
    : [];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gradient-to-b from-indigo-600 to-purple-600 text-white min-h-screen p-6">
        <div className="flex items-center gap-2 mb-8">
          <Briefcase size={24} />
          <span className="font-bold text-lg">Bảng điều khiển</span>
        </div>
        <nav className="flex flex-col gap-4">
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/analytics")}
          >
            <BarChart2 size={20} /> Phân Tích cửa hàng
          </button>
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/order-management")}
          >
            <Truck size={20} /> Quản Lí Đơn hàng
          </button>
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/reviews")}
          >
            <Users size={20} /> Quản Lí Feedback
          </button>
          <button
            onClick={() => navigate("/seller/categories")}
            className="flex items-center gap-2 hover:underline font-semibold underline"
          >
            <PlusCircle size={20} /> Quản Lý Danh Mục
          </button>
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/products")}
          >
            <PlusCircle size={20} /> Quản Lí Sản Phẩm
          </button>
        </nav>
      </aside>

      {/* Main content 2 cột */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Cột trái: Danh mục */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              className="border px-2 py-1 rounded w-full"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Tên danh mục mới..."
              className="border px-2 py-1 rounded w-full"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className={`bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2 ${
                isCreating
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              <PlusCircle size={16} />
              {isCreating ? "Đang thêm..." : "Thêm"}
            </button>
          </div>
          <div className="overflow-y-auto max-h-[60vh]">
            {loading ? (
              <p className="text-center text-gray-500">Đang tải...</p>
            ) : filteredCategories.length === 0 ? (
              <p className="text-center text-gray-500">Không có danh mục nào</p>
            ) : (
              <ul>
                {filteredCategories.map((cat) => (
                  <li
                    key={cat._id}
                    className={`flex items-center justify-between px-2 py-2 rounded cursor-pointer mb-1 transition ${
                      selectedCategory && selectedCategory._id === cat._id
                        ? "bg-indigo-100 text-indigo-700 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span>
                      {editingId === cat._id ? (
                        <input
                          className="border px-2 py-1 rounded w-32"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        cat.name
                      )}
                    </span>
                    <span className="flex gap-1">
                      {editingId === cat._id ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdate(cat._id);
                            }}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Save size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(null);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <XCircle size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(cat._id, cat.name);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(cat._id);
                            }}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Cột phải: Sản phẩm thuộc danh mục */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow p-4">
          {selectedCategory ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-indigo-700 flex-1">
                  Sản phẩm thuộc danh mục: {selectedCategory.name}
                </h3>
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="border px-2 py-1 rounded"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              {loadingProducts ? (
                <p>Đang tải sản phẩm...</p>
              ) : filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500">
                  Không có sản phẩm nào thuộc danh mục này.
                </p>
              ) : (
                <table className="min-w-full text-sm text-left border bg-white rounded shadow">
                  <thead className="bg-indigo-600 text-white">
                    <tr>
                      <th className="px-4 py-2">Ảnh</th>
                      <th className="px-4 py-2">Tên sản phẩm</th>
                      <th className="px-4 py-2">Thương hiệu</th>
                      <th className="px-4 py-2">Giá</th>
                      <th className="px-4 py-2">Kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <img
                            src={
                              (Array.isArray(product.imageurl) &&
                                product.imageurl[0]) ||
                              (Array.isArray(product.imageUrls) &&
                                product.imageUrls[0]) ||
                              (typeof product.imageurl === "string" &&
                                product.imageurl) ||
                              "https://via.placeholder.com/80"
                            }
                            alt={product.product_name}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        </td>
                        <td className="px-4 py-2 font-medium text-blue-600">
                          {product.product_name}
                        </td>
                        <td className="px-4 py-2">{product.brand || "-"}</td>
                        <td className="px-4 py-2">
                          {(product.price || 0).toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="px-4 py-2">{product.quantity || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-2xl mb-2">
                Chọn một danh mục để xem sản phẩm
              </span>
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default ProductCategory;
