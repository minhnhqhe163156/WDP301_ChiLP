import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Heart, 
  ShoppingCart, 
  Eye, 
  Star, 
  StarHalf,
  TrendingUp,
  Zap
} from "lucide-react";

const CompactProductCard = ({ 
  product, 
  favorites, 
  toggleFavorite, 
  viewMode = "grid" 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images || [product.image_url] || [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop"
  ];

  const isFavorite = favorites.has(product._id);
  const isNew = product.createdAt && 
    (new Date() - new Date(product.createdAt)) < (7 * 24 * 60 * 60 * 1000);
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-3 h-3 text-yellow-400 fill-current" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />);
    }

    return stars;
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="flex">
          {/* Product Image */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <img
              src={images[currentImageIndex]}
              alt={product.product_name}
              className="w-full h-full object-cover"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            />
            
            {/* Badges */}
            <div className="absolute top-1 left-1 flex flex-col gap-1">
              {isNew && (
                <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded text-xs font-semibold">
                  Mới
                </span>
              )}
              {hasDiscount && (
                <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded text-xs font-semibold">
                  -{discountPercentage}%
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-1 right-1 flex flex-col gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(product._id);
                }}
                className={`p-1.5 rounded-full transition-all ${
                  isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-white/80 text-gray-600 hover:bg-white"
                }`}
              >
                <Heart className={`w-3 h-3 ${isFavorite ? "fill-current" : ""}`} />
              </button>
              <Link
                to={`/product/${product._id}`}
                className="p-1.5 bg-white/80 text-gray-600 hover:bg-white rounded-full transition-all"
              >
                <Eye className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 hover:text-indigo-600 transition-colors line-clamp-2">
                  <Link to={`/product/${product._id}`}>
                    {product.product_name}
                  </Link>
                </h3>
                
                {/* Brand and Category */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  {product.brand && (
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      {product.brand}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center gap-0.5">
                    {renderStars(product.rating || 4.5)}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.review_count || 12})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right ml-2">
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
                {hasDiscount && (
                  <div className="text-xs text-gray-500 line-through">
                    {formatPrice(product.original_price)}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 text-sm">
                <ShoppingCart className="w-3 h-3" />
                Thêm
              </button>
              <Link
                to={`/product/${product._id}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg font-semibold transition-colors text-sm"
              >
                Chi tiết
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Compact
  return (
    <div 
      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={images[currentImageIndex]}
          alt={product.product_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" />
              Mới
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
              -{discountPercentage}%
            </span>
          )}
          {product.trending && (
            <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" />
              Hot
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-all duration-300 ${
          isHovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
        }`}>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(product._id);
            }}
            className={`p-1.5 rounded-full transition-all ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-600 hover:bg-white"
            }`}
          >
            <Heart className={`w-3 h-3 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <Link
            to={`/product/${product._id}`}
            className="p-1.5 bg-white/90 text-gray-600 hover:bg-white rounded-full transition-all"
          >
            <Eye className="w-3 h-3" />
          </Link>
        </div>

        {/* Image Gallery Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentImageIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Brand */}
        {product.brand && (
          <div className="text-xs text-indigo-600 font-semibold mb-1">
            {product.brand}
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm">
          <Link to={`/product/${product._id}`}>
            {product.product_name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">
            {renderStars(product.rating || 4.5)}
          </div>
          <span className="text-xs text-gray-500">
            ({product.review_count || 12})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}
            </div>
            {hasDiscount && (
              <div className="text-xs text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </div>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 text-sm group-hover:scale-105">
          <ShoppingCart className="w-3 h-3" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default CompactProductCard; 