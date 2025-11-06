import React, { useState } from "react";
import { Filter, X, ChevronDown, ChevronUp, Star } from "lucide-react";

const FILTERS = {
  brand: [
    { name: "NIKE", count: 156, logo: "https://via.placeholder.com/40x20/000000/FFFFFF?text=NIKE" },
    { name: "ADIDAS", count: 128, logo: "https://via.placeholder.com/40x20/000000/FFFFFF?text=ADIDAS" },
    { name: "PUMA", count: 89, logo: "https://via.placeholder.com/40x20/000000/FFFFFF?text=PUMA" },
    { name: "MIZUNO", count: 67, logo: "https://via.placeholder.com/40x20/000000/FFFFFF?text=MIZUNO" },
    { name: "KAMITO", count: 45, logo: "https://via.placeholder.com/40x20/000000/FFFFFF?text=KAMITO" },
    { name: "KIKA", count: 34, logo: "https://via.placeholder.com/40x20/000000/FFFFFF?text=KIKA" },
  ],
  color: [
    { name: "Đen", value: "black", count: 89, hex: "#000000" },
    { name: "Trắng", value: "white", count: 67, hex: "#FFFFFF" },
    { name: "Đỏ", value: "red", count: 45, hex: "#FF0000" },
    { name: "Xanh dương", value: "blue", count: 56, hex: "#0066CC" },
    { name: "Xanh lá", value: "green", count: 34, hex: "#00CC66" },
    { name: "Vàng", value: "yellow", count: 23, hex: "#FFD700" },
    { name: "Cam", value: "orange", count: 28, hex: "#FF6600" },
    { name: "Tím", value: "purple", count: 19, hex: "#6600CC" },
  ],
  price: [
    { label: "Dưới 500K", value: "0-500000", count: 89 },
    { label: "500K - 1 triệu", value: "500000-1000000", count: 156 },
    { label: "1 triệu - 2 triệu", value: "1000000-2000000", count: 234 },
    { label: "2 triệu - 5 triệu", value: "2000000-5000000", count: 167 },
    { label: "Trên 5 triệu", value: "5000000-10000000", count: 45 },
  ],
  size: [
    { name: "36", count: 45 },
    { name: "37", count: 67 },
    { name: "38", count: 89 },
    { name: "39", count: 123 },
    { name: "40", count: 156 },
    { name: "41", count: 134 },
    { name: "42", count: 98 },
    { name: "43", count: 67 },
    { name: "44", count: 45 },
  ],
  sport: [
    { name: "Bóng đá", value: "soccer", count: 234, icon: "⚽" },
    { name: "Bóng rổ", value: "basketball", count: 189, icon: "🏀" },
    { name: "Bơi lội", value: "swimming", count: 67, icon: "🏊" },
    { name: "Gym", value: "gym", count: 145, icon: "💪" },
    { name: "Yoga", value: "yoga", count: 89, icon: "🧘" },
    { name: "Chạy bộ", value: "running", count: 167, icon: "🏃" },
    { name: "Tennis", value: "tennis", count: 78, icon: "🎾" },
  ],
  rating: [
    { value: 5, count: 234, stars: 5 },
    { value: 4, count: 456, stars: 4 },
    { value: 3, count: 189, stars: 3 },
    { value: 2, count: 67, stars: 2 },
    { value: 1, count: 23, stars: 1 },
  ],
};

export default function AdvancedFilterSidebar({ filters, setFilters, onClose }) {
  const [open, setOpen] = useState({
    brand: true,
    color: true,
    price: true,
    size: true,
    sport: true,
    rating: false,
  });

  const handleCheckbox = (group, value) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((v) => v !== value)
        : [...prev[group], value],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      brand: [],
      color: [],
      price: [],
      size: [],
      sport: [],
      rating: [],
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300">
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
              {getActiveFilterCount() > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Filter Sections */}
          <div className="space-y-6">
            {/* Brand Filter */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => setOpen((o) => ({ ...o, brand: !o.brand }))}
                className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
              >
                <span className="text-base">Thương hiệu</span>
                {open.brand ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {open.brand && (
                <div className="space-y-2">
                  {FILTERS.brand.map((brand) => (
                    <label
                      key={brand.name}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={filters.brand.includes(brand.name)}
                          onChange={() => handleCheckbox("brand", brand.name)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-8 h-4 object-contain"
                        />
                        <span className="text-sm text-gray-700">{brand.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {brand.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sport Type Filter */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => setOpen((o) => ({ ...o, sport: !o.sport }))}
                className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
              >
                <span className="text-base">Môn thể thao</span>
                {open.sport ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {open.sport && (
                <div className="space-y-2">
                  {FILTERS.sport.map((sport) => (
                    <label
                      key={sport.value}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={filters.sport.includes(sport.value)}
                          onChange={() => handleCheckbox("sport", sport.value)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-lg">{sport.icon}</span>
                        <span className="text-sm text-gray-700">{sport.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {sport.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Color Filter */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => setOpen((o) => ({ ...o, color: !o.color }))}
                className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
              >
                <span className="text-base">Màu sắc</span>
                {open.color ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {open.color && (
                <div className="grid grid-cols-2 gap-2">
                  {FILTERS.color.map((color) => (
                    <label
                      key={color.value}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.color.includes(color.value)}
                          onChange={() => handleCheckbox("color", color.value)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm text-gray-700">{color.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {color.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => setOpen((o) => ({ ...o, price: !o.price }))}
                className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
              >
                <span className="text-base">Khoảng giá</span>
                {open.price ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {open.price && (
                <div className="space-y-2">
                  {FILTERS.price.map((price) => (
                    <label
                      key={price.value}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={filters.price.includes(price.value)}
                          onChange={() => handleCheckbox("price", price.value)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{price.label}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {price.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Size Filter */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => setOpen((o) => ({ ...o, size: !o.size }))}
                className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
              >
                <span className="text-base">Kích thước</span>
                {open.size ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {open.size && (
                <div className="grid grid-cols-3 gap-2">
                  {FILTERS.size.map((size) => (
                    <label
                      key={size.name}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.size.includes(size.name)}
                          onChange={() => handleCheckbox("size", size.name)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{size.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {size.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <div className="border-b border-gray-100 pb-4">
              <button
                onClick={() => setOpen((o) => ({ ...o, rating: !o.rating }))}
                className="w-full flex justify-between items-center font-semibold text-gray-900 mb-3"
              >
                <span className="text-base">Đánh giá</span>
                {open.rating ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {open.rating && (
                <div className="space-y-2">
                  {FILTERS.rating.map((rating) => (
                    <label
                      key={rating.value}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={filters.rating.includes(rating.value)}
                          onChange={() => handleCheckbox("rating", rating.value)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating.stars
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-700">trở lên</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {rating.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clear Filters Button */}
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 