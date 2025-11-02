import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../api/api";
import { cartAPI } from "../api/api";
import { sendChatToSellerWithProduct } from "../api/chat";
import {
  Heart,
  Share2,
  ShoppingCart,
  Zap,
  Shield,
  Truck,
  Star,
  Trophy,
  Target,
  Activity,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ArrowLeft,
  Eye,
  Users,
  Clock,
  Award,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { reviewAPI } from "../api/api";
import { wishlistAPI } from "../api/api";

const ProductDetail = () => {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartLoading, setCartLoading] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
  });
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [myReview, setMyReview] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    productAPI
      .getProductById(id)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không tìm thấy sản phẩm hoặc có lỗi xảy ra.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const userId = user?._id || user?.id || user?.googleId;
    if (activeTab === "reviews" && product && userId) {
      setReviewLoading(true);
      reviewAPI
        .getReviewStats(product._id)
        .then((res) => setReviewSummary(res.data))
        .catch(() => setReviewSummary({ averageRating: 0, totalReviews: 0 }));
      reviewAPI
        .getReviewByProduct(product._id)
        .then((res) => setReviews(res.data))
        .catch(() => setReviews([]))
        .finally(() => setReviewLoading(false));
      if (userId) {
        reviewAPI
          .getReviewByUser(userId)
          .then((res) => {
            const found = Array.isArray(res.data)
              ? res.data.find((r) => r.product_id === product._id)
              : null;
            setMyReview(found || null);
          })
          .catch(() => setMyReview(null));
      }
    }
  }, [activeTab, product, user]);

  useEffect(() => {
    // Kiểm tra sản phẩm đã nằm trong wishlist chưa
    const checkWishlist = async () => {
      if (!user || !product) return;
      try {
        const res = await wishlistAPI.getWishlistByUserEmail(user.email);
        if (Array.isArray(res.data)) {
          const found = res.data.find(item => item.product_id === product._id || (item.product_id && item.product_id._id === product._id));
          setIsLiked(!!found);
        }
      } catch (err) {
        console.error("Wishlist check error:", err);
      }
    };
    checkWishlist();
  }, [user, product]);

  const handleAddToCart = async () => {
    if (cartLoading) return;
    setCartLoading(true);
    if (!user) {
      navigate("/loginandregister");
      setCartLoading(false);
      return;
    }
    if (user.role !== "customer") {
      alert("Chỉ khách hàng mới có thể thêm vào giỏ hàng.");
      setCartLoading(false);
      return;
    }
    if (!product) {
      setCartLoading(false);
      return;
    }
    const size = sizes[selectedSize];
    if (!size) {
      alert("Vui lòng chọn kích thước.");
      setCartLoading(false);
      return;
    }
    try {
      await cartAPI.addToCart({
        productId: product._id,
        quantity,
        size,
      });
      setShowSuccess(true);
      // Phát event cart-updated để header cập nhật lại số lượng
      window.dispatchEvent(new Event("cart-updated"));
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      let msg = "Không thể thêm vào giỏ hàng.";
      if (err?.response?.data?.message) msg += `\n${err.response.data.message}`;
      alert(msg);
    }
    setCartLoading(false);
  };

  const handleChatWithSeller = async () => {
    if (!user) {
      navigate("/loginandregister");
      return;
    }
    try {
      const sellerId =
        typeof product.seller_id === "object"
          ? product.seller_id._id
          : product.seller_id;
      const messageText = `Tôi quan tâm sản phẩm: ${
        product.product_name
      } - Giá: ${product.price.toLocaleString()}₫`;
      const res = await sendChatToSellerWithProduct(sellerId, product._id, {
        message: messageText,
      });
      const conversationId = res.data?.conversation;
      if (conversationId) {
        navigate(`/conversations?conversationId=${conversationId}`);
        return;
      }
      alert(
        "Không thể bắt đầu cuộc trò chuyện với người bán (không có conversationId)."
      );
    } catch (err) {
      let errorMsg = "Không thể bắt đầu cuộc trò chuyện với người bán.";
      if (err?.response) {
        errorMsg += `\nStatus: ${err.response.status}`;
        if (err.response.data?.message) {
          errorMsg += `\n${err.response.data.message}`;
        } else if (err.response.data?.error) {
          errorMsg += `\n${err.response.data.error}`;
        } else {
          errorMsg += `\n${JSON.stringify(err.response.data)}`;
        }
      } else if (err?.request) {
        errorMsg += "\nKhông nhận được phản hồi từ server.";
      } else {
        errorMsg += `\n${err.message}`;
      }
      alert(errorMsg);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      console.log("Chưa đăng nhập!");
      return;
    }
    try {
      if (isLiked) {
        await wishlistAPI.removeFromWishlist(product._id);
      } else {
        await wishlistAPI.addToWishlist({ product_id: product._id });
      }
      setIsLiked(!isLiked);
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (err) {
      console.error("Wishlist error:", err);
      // Có thể toast lỗi ở đây
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/loginandregister");
      return;
    }
    if (user.role !== "customer") {
      alert("Chỉ khách hàng mới có thể mua hàng.");
      return;
    }
    if (!product) return;
    const size = sizes[selectedSize];
    if (!size) {
      alert("Vui lòng chọn kích thước.");
      return;
    }
    if (quantity < 1 || quantity > (product.quantity || 99)) {
      alert("Số lượng không hợp lệ!");
      return;
    }

    setCartLoading(true);
    try {
      // Thêm vào giỏ hàng backend
      await cartAPI.addToCart({
        productId: product._id,
        quantity,
        size,
      });
      // Fetch lại giỏ hàng để đồng bộ localStorage
      const res = await cartAPI.getCart();
      localStorage.setItem("cart", JSON.stringify(res.data.items || []));
      window.dispatchEvent(new Event("cart-updated"));
      setCartLoading(false);
      // Chuyển sang trang giỏ hàng hoặc shipping info tùy ý
      // Nếu muốn chuyển sang giỏ hàng:
      // navigate("/cart");
      // Nếu muốn chuyển sang shipping info:
      navigate("/checkout/shipping?mode=buyNow");
    } catch (err) {
      setCartLoading(false);
      alert("Không thể thêm vào giỏ hàng: " + (err.response?.data?.message || err.message));
    }
  };

  const nextImage = () => {
    if (imageUrls.length > 1) {
      setCurrentImage((prev) => (prev + 1) % imageUrls.length);
    }
  };

  const prevImage = () => {
    if (imageUrls.length > 1) {
      setCurrentImage(
        (prev) => (prev - 1 + imageUrls.length) % imageUrls.length
      );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-lg text-gray-600 font-medium">
            Đang tải sản phẩm...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="text-5xl">😕</div>
          <p className="text-lg text-red-600 font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );

  if (!product) return null;

  const price = product.discount_price || product.price;
  const originalPrice = product.discount_price ? product.price : null;
  const discount = product.discount_price
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100
      )
    : 0;

  const sizes = Array.isArray(product.size)
    ? product.size
    : product.size
    ? [String(product.size)]
    : ["38", "39", "40", "41", "42", "43", "44"];
  const features = product.specifications
    ? Object.values(product.specifications)
    : [
        "Air Max Technology",
        "React Foam Cushioning",
        "Breathable Mesh Upper",
        "Durable Rubber Outsole",
        "Lightweight Design",
        "Athletic Performance",
      ];

  let imageUrls = [];
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    imageUrls = product.imageUrls;
  } else if (Array.isArray(product.imageurl) && product.imageurl.length > 0) {
    imageUrls = product.imageurl;
  } else if (
    typeof product.imageurl === "string" &&
    product.imageurl.includes(",")
  ) {
    imageUrls = product.imageurl.split(",").map((s) => s.trim());
  } else if (
    typeof product.imageurl === "string" &&
    product.imageurl.trim() !== ""
  ) {
    imageUrls = [product.imageurl.trim()];
  }

  if (imageUrls.length === 0) {
    imageUrls = ["https://via.placeholder.com/500x500?text=No+Image"];
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
            <ShoppingCart className="w-5 h-5" />
            <div>
              <p className="font-semibold">Thêm vào giỏ hàng thành công!</p>
              <p className="text-sm">
                Sản phẩm đã được thêm vào giỏ hàng của bạn
              </p>
              <button
                onClick={() => navigate("/cart")}
                className="mt-2 bg-white text-green-600 font-semibold px-3 py-1 rounded-lg hover:bg-green-100 transition"
              >
                Xem giỏ hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Navigation */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Quay lại</span>
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">
              PACEUPSHOP
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:text-gray-900 transition">
              <Eye className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={imageUrls[currentImage]}
                alt={product.product_name}
                className="w-full h-[400px] object-contain transition-transform duration-300 hover:scale-105"
              />
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && (
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    -{discount}%
                  </div>
                )}
                <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  BESTSELLER
                </div>
              </div>
            </div>
            {imageUrls.length > 1 && (
              <div className="flex gap-2 justify-center overflow-x-auto">
                {imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-16 h-16 rounded-md border-2 transition ${
                      currentImage === index
                        ? "border-indigo-500"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.product_name} ${index + 1}`}
                      className="w-full h-full object-contain rounded-md"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  {product.category}
                </span>
                <span>SKU: {product._id?.slice(-6) || "N/A"}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {product.product_name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.averageRating || 4.5)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">
                  {product.averageRating || 4.5}
                </span>
                <span className="text-gray-600">
                  ({product.totalReviews || 127} đánh giá)
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-gray-900">
                  {price ? price.toLocaleString("vi-VN") : "N/A"}₫
                </span>
                {originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {originalPrice.toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>
              {originalPrice && (
                <div className="flex items-center gap-2 text-green-600 mt-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    Tiết kiệm {(originalPrice - price).toLocaleString("vi-VN")}₫
                  </span>
                </div>
              )}
            </div>

            <div className="lg:hidden">
              <p className="text-gray-700">{product.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Kích thước
                </h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800">
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(index)}
                    className={`h-10 rounded-md border font-medium transition ${
                      selectedSize === index
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <label className="text-lg font-semibold text-gray-900">
                  Số lượng
                </label>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-md"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={product.quantity || 99}
                    value={quantity}
                    onChange={(e) => {
                      const val = Math.max(
                        1,
                        Math.min(
                          product.quantity || 99,
                          parseInt(e.target.value) || 1
                        )
                      );
                      setQuantity(val);
                    }}
                    className="w-16 h-10 text-center font-semibold bg-transparent border-none"
                  />
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(product.quantity || 99, quantity + 1)
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-md"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold">
                    Còn {product.quantity || 15} sản phẩm
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Cập nhật 2 giờ trước</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className={`bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 ${
                    cartLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartLoading ? "Đang thêm..." : "Thêm vào giỏ"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Mua ngay
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleChatWithSeller}
                  className="bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat ngay
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`border-2 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                    isLiked
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-200 hover:border-gray-400 text-gray-700"
                  }`}
                  style={{ zIndex: 2 }}
                >
                  <Heart
                    className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`}
                  />
                  {isLiked ? "Đã yêu thích" : "Yêu thích"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  Chính hãng 100%
                </h4>
                <p className="text-xs text-gray-600">Bảo hành chính hãng</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  Giao hàng nhanh
                </h4>
                <p className="text-xs text-gray-600">
                  Miễn phí ship cho đơn {">"} 500k
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  Đổi trả 30 ngày
                </h4>
                <p className="text-xs text-gray-600">Dễ dàng đổi trả</p>
              </div>
            </div>

            <div className="hidden lg:block pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900">
                Mô tả sản phẩm
              </h3>
              <p className="text-gray-700 mt-2">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b">
              <div className="flex gap-6 px-4">
                {[
                  { id: "description", label: "Mô tả sản phẩm" },
                  { id: "features", label: "Tính năng" },
                  { id: "reviews", label: "Đánh giá" },
                  { id: "shipping", label: "Vận chuyển" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-4 font-semibold text-sm ${
                      activeTab === tab.id
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {activeTab === "description" && (
                <div className="space-y-6">
                  <p className="text-gray-700">{product.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Thông số kỹ thuật
                      </h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>
                          <strong>Chất liệu:</strong> Mesh + Synthetic
                        </li>
                        <li>
                          <strong>Đế giày:</strong> Rubber + Eva
                        </li>
                        <li>
                          <strong>Xuất xứ:</strong> Vietnam
                        </li>
                        <li>
                          <strong>Bảo hành:</strong> 6 tháng
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Hướng dẫn sử dụng
                      </h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Thích hợp cho chạy bộ, gym, thể thao</li>
                        <li>• Vệ sinh bằng khăn ẩm</li>
                        <li>• Tránh ngâm nước trực tiếp</li>
                        <li>• Bảo quản nơi khô ráo, thoáng mát</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "features" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 flex items-start gap-3"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {feature}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          Công nghệ tiên tiến mang lại trải nghiệm tốt nhất.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(reviewSummary.averageRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="font-semibold">
                        {(Number(reviewSummary.averageRating) || 0).toFixed(1)}
                      </span>
                      <span className="text-gray-600">
                        ({reviewSummary.totalReviews} đánh giá)
                      </span>
                    </div>
                  </div>
                  {myReview && (
                    <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                      <div className="flex items-center gap-2 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < myReview.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="font-semibold text-indigo-700">
                          {user.name || "Bạn"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(myReview.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-gray-700">{myReview.comment}</div>
                    </div>
                  )}
                  {reviewLoading ? (
                    <div className="text-center text-gray-600">
                      Đang tải đánh giá...
                    </div>
                  ) : (
                    <>
                      {reviews.length === 0 && (
                        <div className="text-center text-gray-600">
                          Chưa có đánh giá nào.
                        </div>
                      )}
                      <div className="space-y-4">
                        {reviews.map((r) => (
                          <div
                            key={r._id}
                            className="bg-gray-50 rounded-lg p-4 flex gap-3"
                          >
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                              {r.user_id?.avatar ? (
                                <img
                                  src={r.user_id.avatar}
                                  alt={r.user_id.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                r.user_id?.name?.[0] || "U"
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < r.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="font-semibold text-gray-900">
                                  {r.user_id?.name || "User"}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {new Date(r.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-gray-700">{r.comment}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              {activeTab === "shipping" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thông tin vận chuyển
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Truck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Giao hàng miễn phí
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Đơn hàng từ 500.000₫ trở lên
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Giao hàng nhanh
                          </h4>
                          <p className="text-gray-600 text-sm">
                            2-3 ngày làm việc trong nội thành
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Chính sách đổi trả
                    </h4>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Đổi trả trong vòng 30 ngày</li>
                      <li>• Sản phẩm chưa qua sử dụng</li>
                      <li>• Giữ nguyên bao bì, nhãn mác</li>
                      <li>• Hỗ trợ đổi size miễn phí</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
