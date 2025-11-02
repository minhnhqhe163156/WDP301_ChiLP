import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaTags,
  FaStar,
  FaSearch,
  FaFilter,
  FaTimes,
  FaThLarge,
  FaList,
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {
  Heart,
  Eye,
  ShoppingCart,
  Star,
  Grid,
  List,
  X,
  Check,
  Package,
  Sparkles,
} from "lucide-react";
import ProductCard from "../../components/ProductCard";
import { productAPI } from "../../api/api";

const FILTERS = {
  brand: ["Nike", "Adidas", "Puma", "Mizuno", "Kamito", "Kika"],
  color: ["Đen", "Trắng", "Đỏ", "Xanh", "Vàng", "Hồng", "Cam"],
  size: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
  price: [
    { label: "Dưới 500K", value: "0-500000" },
    { label: "500K - 1 triệu", value: "500000-1000000" },
    { label: "1 triệu - 2 triệu", value: "1000000-2000000" },
    { label: "2 triệu - 5 triệu", value: "2000000-5000000" },
    { label: "Trên 5 triệu", value: "5000000-10000000" },
  ],
};

const CollectionProducts = () => {
  const { type, value } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    brand: [],
    color: [],
    price: [],
    size: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    brand: true,
    color: true,
    price: true,
    size: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productAPI.getProducts();
        let allProducts = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];
        let filtered = allProducts;
        if (type === "brands") {
          filtered = filtered.filter(
            (p) => p.brand?.toLowerCase() === value.toLowerCase()
          );
        } else if (type === "sports") {
          filtered = filtered.filter(
            (p) =>
              Array.isArray(p.tags) &&
              p.tags.map((t) => t.toLowerCase()).includes(value.toLowerCase())
          );
        } else if (type === "new" && value === "arrivals") {
          // Sort by creation date and get the newest products
          filtered = filtered.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
        } else if (type === "accessories") {
          filtered = filtered.filter((p) => {
            const catName =
              p.category_id?.name?.toLowerCase().replace(/\s+/g, "") || "";
            const val = value.toLowerCase().replace(/\s+/g, "");
            return catName === val;
          });
        } else if (type === "categories") {
          filtered = filtered.filter((p) => {
            const catName =
              p.category_id?.name?.toLowerCase().replace(/\s+/g, "") || "";
            const val = value.toLowerCase().replace(/\s+/g, "");
            return catName === val;
          });
        }

        setProducts(filtered);
      } catch {
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [type, value]);

  // Lọc sản phẩm theo filter, search, sort
  const getFilteredProducts = () => {
    let filtered = [...products];
    if (filters.brand.length > 0)
      filtered = filtered.filter((p) => filters.brand.includes(p.brand));
    if (filters.color.length > 0)
      filtered = filtered.filter((p) => filters.color.includes(p.color));
    if (filters.size.length > 0)
      filtered = filtered.filter((p) => filters.size.includes(String(p.size)));
    if (filters.price.length > 0) {
      filtered = filtered.filter((p) => {
        return filters.price.some((range) => {
          const [min, max] = range.split("-").map(Number);
          return p.price >= min && p.price <= max;
        });
      });
    }
    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.product_name && p.product_name.toLowerCase().includes(lower)) ||
          (p.brand && p.brand.toLowerCase().includes(lower))
      );
    }
    if (sortBy === "newest") {
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortBy === "price-low") {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      filtered = filtered.sort((a, b) =>
        (a.product_name || "").localeCompare(b.product_name || "")
      );
    }
    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const activeFilterCount = Object.values(filters).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      paginate(currentPage - 1);
    }
  };

  // Next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      paginate(currentPage + 1);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortBy]);

  const handleFilterChange = (group, value) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((v) => v !== value)
        : [...prev[group], value],
    }));
  };

  const clearAllFilters = () =>
    setFilters({ brand: [], color: [], price: [], size: [] });

  const toggleFilterExpand = (filterName) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  // UI helpers
  const getCollectionDisplayName = (type, value) => {
    // Decode URL-encoded value and replace hyphens with spaces
    const decodedValue = decodeURIComponent(value).replace(/-/g, ' ');
    
    // Convert to title case (capitalize first letter of each word)
    const toTitleCase = (str) => {
      return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    const displayNames = {
      brands: {
        nike: "Nike",
        adidas: "Adidas",
        puma: "Puma",
        mizuno: "Mizuno",
        kamito: "Kamito",
        kika: "Kika",
      },
      sports: {
        soccer: "Bóng Đá",
        basketball: "Bóng Rổ",
        swimming: "Bơi Lội",
        gym: "Gym",
        yoga: "Yoga",
      },
      accessories: {
        socks: "Tất",
        gloves: "Găng Tay",
        bags: "Túi Đựng",
        bottle: "Bình Nước",
        hat: "Mũ/Nón",
      },
      new: {
        arrivals: "Hàng Mới Về",
      },
      categories: {
        "quan-ao-chay-bo-nam": "Quần Áo Chạy Bộ Nam",
        "quan-ao-chay-bo-nu": "Quần Áo Chạy Bộ Nữ",
        "giay-chay-bo": "Giày Chạy Bộ",
        "phu-kien-chay-bo": "Phụ Kiện Chạy Bộ",
      }
    };

    // First check if we have a predefined display name
    if (displayNames[type]?.[value.toLowerCase()]) {
      return displayNames[type][value.toLowerCase()];
    }

    // If no predefined name, format the decoded value
    return toTitleCase(decodedValue);
  };
  const collectionTitle = getCollectionDisplayName(type, value);

  const FilterSection = ({ title, filterKey, options, icon: Icon }) => (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => toggleFilterExpand(filterKey)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span className="font-semibold text-gray-800">{title}</span>
          {filters[filterKey].length > 0 && (
            <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">
              {filters[filterKey].length}
            </span>
          )}
        </div>
        {expandedFilters[filterKey] ? (
          <FaChevronUp className="w-3 h-3 text-gray-400" />
        ) : (
          <FaChevronDown className="w-3 h-3 text-gray-400" />
        )}
      </button>
      {expandedFilters[filterKey] && (
        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option.value || option}
              className="flex items-center gap-3 cursor-pointer text-sm hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters[filterKey].includes(option.value || option)}
                  onChange={() =>
                    handleFilterChange(filterKey, option.value || option)
                  }
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    filters[filterKey].includes(option.value || option)
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {filters[filterKey].includes(option.value || option) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              <span className="text-gray-700">{option.label || option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header với gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaTags className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Bộ sưu tập: {collectionTitle}
              </h1>
              <p className="text-black/80 mt-1">
                Khám phá {filteredProducts.length} sản phẩm chất lượng
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-x-24">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                  <FaFilter className="text-indigo-500" />
                  Bộ lọc
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Xóa tất cả
                  </button>
                )}
              </div>

              <FilterSection
                title="Thương hiệu"
                filterKey="brand"
                options={FILTERS.brand}
                icon={Package}
              />
              <FilterSection
                title="Màu sắc"
                filterKey="color"
                options={FILTERS.color}
                icon={Sparkles}
              />
              <FilterSection
                title="Kích thước"
                filterKey="size"
                options={FILTERS.size}
              />
              <FilterSection
                title="Khoảng giá"
                filterKey="price"
                options={FILTERS.price}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 lg:ml-8">
            {/* Controls Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    <FaFilter className="w-4 h-4" />
                    Bộ lọc
                    {activeFilterCount > 0 && (
                      <span className="bg-white text-indigo-600 px-2 py-1 rounded-full text-xs font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Search */}
                  <div className="relative flex-1 md:w-80">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-200 px-4 py-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price-low">Giá tăng dần</option>
                    <option value="price-high">Giá giảm dần</option>
                    <option value="name">Tên A-Z</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-white shadow-sm text-indigo-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "list"
                          ? "bg-white shadow-sm text-indigo-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, values]) =>
                      values.map((value) => (
                        <span
                          key={`${key}-${value}`}
                          className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                        >
                          {FILTERS[key].find(
                            (option) => (option.value || option) === value
                          )?.label || value}
                          <button
                            onClick={() => handleFilterChange(key, value)}
                            className="hover:bg-indigo-200 rounded-full p-1 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <br />
            {/* Products Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600 text-lg">Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-white" />
                  </div>
                  {error}
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaSearch className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để tìm thấy sản
                  phẩm phù hợp
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {currentProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      className={viewMode === "list" ? "flex flex-row" : ""}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2">
                      {/* Previous button */}
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FaChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Page numbers */}
                      <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          // Show first page, last page, current page, and pages around current page
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`px-4 py-2 rounded-lg ${
                                  currentPage === pageNumber
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return <span key={pageNumber} className="px-2">...</span>;
                          }
                          return null;
                        })}
                      </div>

                      {/* Next button */}
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg ${
                          currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FaChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-gray-900">Bộ lọc</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FilterSection
              title="Thương hiệu"
              filterKey="brand"
              options={FILTERS.brand}
              icon={Package}
            />
            <FilterSection
              title="Màu sắc"
              filterKey="color"
              options={FILTERS.color}
              icon={Sparkles}
            />
            <FilterSection
              title="Kích thước"
              filterKey="size"
              options={FILTERS.size}
            />
            <FilterSection
              title="Khoảng giá"
              filterKey="price"
              options={FILTERS.price}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Xóa tất cả
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionProducts;
