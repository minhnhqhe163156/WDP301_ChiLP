import React from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, ShoppingCart, Star } from "lucide-react";

const ProductCard = ({
  product,
  user,
  favorites = new Set(),
  toggleFavorite = () => {},
  addToCart = () => {},
  hoveredProduct = null,
  setHoveredProduct = () => {},
  className = "",
}) => (
  <Link to={`/product/${product._id}`} className="block">
    <div
      className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 ${className}`}
      onMouseEnter={() => setHoveredProduct(product._id)}
      onMouseLeave={() => setHoveredProduct(null)}
      style={{ minHeight: 280 }} // Điều chỉnh chiều cao để khớp với ảnh
    >
      {/* Discount Badge */}
      {product.discount_price && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
          -
          {Math.round(
            ((product.price - product.discount_price) / product.price) * 100
          )}
          %
        </div>
      )}
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(product._id);
        }}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white transition-all"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            favorites.has(product._id)
              ? "text-red-500 fill-red-500"
              : "text-gray-400"
          }`}
        />
      </button>
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <img
          src={
            Array.isArray(product.imageurl)
              ? product.imageurl[0]
              : product.imageurl
          }
          alt={product.product_name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay Actions */}
        <div
          className={`absolute inset-0 bg-black/30 flex items-center justify-center gap-2 transition-opacity duration-200 ${
            hoveredProduct === product._id ? "opacity-100" : "opacity-0"
          }`}
        >
          {user && (
            <button
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
              onClick={(e) => e.preventDefault()}
            >
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
          )}
          {user && (
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(product._id);
              }}
              className="p-2 bg-blue-600 rounded-full shadow hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
      {/* Product Info */}
      <div className="p-3">
        <div className="mb-1">
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
            {product.brand}
          </span>
        </div>
        <h3 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors text-sm line-clamp-2">
          {product.product_name}
        </h3>
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating || 0)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            ({product.totalReviews || 0} đánh giá)
          </span>
        </div>
        {/* Price */}
        <div className="flex items-center gap-1">
          <span className="text-base font-bold text-red-600">
            {(product.discount_price || product.price).toLocaleString()}₫
          </span>
          {product.discount_price && (
            <span className="text-xs text-gray-500 line-through">
              {product.price.toLocaleString()}₫
            </span>
          )}
        </div>
      </div>
    </div>
  </Link>
);

export default ProductCard;
