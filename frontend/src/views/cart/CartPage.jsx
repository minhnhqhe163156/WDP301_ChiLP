import React, { useEffect, useState } from "react";
import { cartAPI } from "../../api/api";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await cartAPI.getCart();
      setCart(res.data);
      setError(null);
    } catch {
      setError("Không thể tải giỏ hàng. Vui lòng đăng nhập hoặc thử lại.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    setUpdating(true);
    try {
      await cartAPI.updateQuantity(itemId, quantity);
      fetchCart();
    } catch {
      alert("Không thể cập nhật số lượng.");
    }
    setUpdating(false);
  };

  const handleRemoveItem = async (itemId) => {
    setRemovingItem(itemId);
    try {
      await cartAPI.removeItem(itemId);
      fetchCart();
      // Phát event cart-updated để header cập nhật lại số lượng
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      alert("Không thể xóa sản phẩm khỏi giỏ hàng.");
    }
    setRemovingItem(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">
              Đang tải giỏ hàng...
            </h2>
            <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchCart}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition duration-200 shadow-lg hover:shadow-xl"
              >
                Tiếp tục mua sắm
              </button>
              <button
                onClick={() => navigate("/wishlist")}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition duration-200"
              >
                Xem danh sách yêu thích
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-600">
            Bạn có {cart.items.length} sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">📦</span>
                Sản phẩm ({cart.items.length})
              </h2>

              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item._id}
                    className={`relative bg-gray-50 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${
                      removingItem === item._id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={
                            Array.isArray(item.product?.imageurl) &&
                            item.product.imageurl[0]
                              ? item.product.imageurl[0]
                              : item.product?.images?.[0] ||
                                "https://via.placeholder.com/100"
                          }
                          alt={item.product?.name}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                        />
                        {removingItem === item._id && (
                          <div className="absolute inset-0 bg-red-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-800 truncate hover:text-indigo-600 transition-colors">
                          {item.product?.name}
                        </h3>
                        <div className="text-gray-500 text-sm mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Size: {Array.isArray(item.size) ? item.size.join(", ") : item.size}
                          </span>
                        </div>
                        <div className="text-xl font-bold text-indigo-600 mb-3">
                          {item.product?.discount_price != null && item.product.discount_price < item.price ? (
                            <>
                              <span>{item.product.discount_price.toLocaleString("vi-VN")}₫</span>
                              <span className="text-gray-400 text-base line-through ml-2">{item.price.toLocaleString("vi-VN")}₫</span>
                            </>
                          ) : (
                            <span>{item.price?.toLocaleString("vi-VN")}₫</span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity - 1
                                )
                              }
                              disabled={updating || item.quantity <= 1}
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="px-4 py-2 text-gray-800 font-semibold min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item._id,
                                  item.quantity + 1
                                )
                              }
                              disabled={updating}
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={updating || removingItem === item._id}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Xóa sản phẩm"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">
                          {item.product?.discount_price != null && item.product.discount_price < item.price
                            ? (item.product.discount_price * item.quantity).toLocaleString("vi-VN")
                            : (item.price * item.quantity).toLocaleString("vi-VN")
                          }₫
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} × {item.product?.discount_price != null && item.product.discount_price < item.price
                            ? item.product.discount_price.toLocaleString("vi-VN")
                            : item.price?.toLocaleString("vi-VN")
                          }₫
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">📋</span>
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">
                    {cart.subtotal?.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                {/* Always show free shipping, remove the 500k notice */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-gray-800">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-indigo-600">{cart.subtotal?.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                  onClick={() => navigate("/checkout/shipping")}
                >
                  Tiến hành thanh toán
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Tiếp tục mua sắm
                  </span>
                </button>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center text-green-700">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    Thanh toán an toàn
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Thông tin của bạn được bảo mật hoàn toàn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
