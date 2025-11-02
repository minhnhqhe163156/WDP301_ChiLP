import React, { useState } from "react";
import { Grid, List } from "lucide-react";
import ProductCardSelector from "../components/ProductCardSelector";

const ProductCardExamples = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [cardType, setCardType] = useState("compact");
  const [favorites, setFavorites] = useState(new Set());

  // Sample products
  const sampleProducts = [
    {
      _id: "1",
      product_name: "Nike Air Max 270",
      brand: "NIKE",
      price: 2500000,
      original_price: 3000000,
      rating: 4.5,
      review_count: 128,
      image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      trending: true
    },
    {
      _id: "2",
      product_name: "Adidas Ultraboost 22",
      brand: "ADIDAS",
      price: 3200000,
      rating: 4.8,
      review_count: 95,
      image_url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop"
    },
    {
      _id: "3",
      product_name: "Puma RS-X",
      brand: "PUMA",
      price: 1800000,
      original_price: 2200000,
      rating: 4.2,
      review_count: 67,
      image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop"
    },
    {
      _id: "4",
      product_name: "Mizuno Wave Rider 25",
      brand: "MIZUNO",
      price: 2100000,
      rating: 4.6,
      review_count: 43,
      image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop"
    }
  ];

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product Card Examples
          </h1>
          <p className="text-gray-600">
            So sánh các loại ProductCard khác nhau
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Card Type:
              </label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                                 <option value="compact">Compact (128px)</option>
                <option value="enhanced">Enhanced (192px)</option>
                <option value="original">Original</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                View Mode:
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards */}
        <div
          className={
            viewMode === "grid"
                               ? cardType === "compact"
                   ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4"
                   : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {sampleProducts.map((product) => (
            <ProductCardSelector
              key={product._id}
              product={product}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              viewMode={viewMode}
              cardType={cardType}
            />
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-12 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              So Sánh Các Loại ProductCard
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tính Năng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enhanced
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Kích thước ảnh
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     128px (h-32)
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    192px (h-48)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Variable
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Grid Columns (Desktop)
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     3 columns
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3 columns
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3-4 columns
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Badge Support
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ❌
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Quick Actions
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ❌
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Image Gallery
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ❌
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    List View
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ✅
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ❌
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardExamples; 