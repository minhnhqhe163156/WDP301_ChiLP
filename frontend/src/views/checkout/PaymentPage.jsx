// PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI } from "../../api/api";
import { createOrder } from "../../api/paymentApi";
import { validateVoucher } from "../../api/voucherApi";
import { getOrder } from "../../api/orderApi";
import { debounce } from "lodash";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("ZaloPay"); // Mặc định chọn ZaloPay
  const [successMessage, setSuccessMessage] = useState("");
  const [voucher, setVoucher] = useState("");
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null); // Thêm state lưu order từ BE
  const navigate = useNavigate();

  const fetchCart = async () => {
    setCartLoading(true);
    try {
      const res = await cartAPI.getCart();
      console.log("=== [PACEUPSHOP][FE] Cart data:", res.data);
      setCart(res.data);
    } catch (error) {
      console.error("=== [PACEUPSHOP][FE] Error fetching cart:", {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
      alert("Không thể tải giỏ hàng. Vui lòng đăng nhập lại hoặc kiểm tra kết nối!");
    }
    setCartLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const debouncedHandlePayment = debounce(async () => {
    if (voucher && !voucherInfo) {
      alert("Vui lòng kiểm tra mã voucher trước khi thanh toán!");
      setLoading(false);
      return;
    }
    // Kiểm tra mode buyNow
    const mode = new URLSearchParams(window.location.search).get("mode");
    let items = [];
    if (mode === "buyNow") {
      const buyNowItem = JSON.parse(localStorage.getItem("buyNowItem"));
      if (!buyNowItem) {
        alert("Không tìm thấy sản phẩm mua ngay!");
        setLoading(false);
        return;
      }
      items = [buyNowItem];
    } else {
      if (!cart || cart.items.length === 0) {
        alert("Giỏ hàng trống!");
        setLoading(false);
        return;
      }
      items = cart.items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.price,
        discount_price: item.product.discount_price || item.price,
        size: item.size,
      }));
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const user_id = user._id || user.id;
    if (!user_id) {
      alert("Bạn cần đăng nhập để thanh toán!");
      setLoading(false);
      return;
    }
    const shipping_address = JSON.parse(localStorage.getItem("shipping_address") || "{}");
    if (!shipping_address.name || !shipping_address.phone || !shipping_address.address) {
      alert("Vui lòng nhập thông tin giao hàng!");
      setLoading(false);
      return;
    }

    try {
      console.log("[LOG][FE] voucherInfo khi thanh toán:", voucherInfo);
      const orderData = {
        user_id,
        paymentMethod,
        shipping_address,
        items,
        voucher: voucherInfo?.code || voucher, // Đảm bảo luôn truyền voucher code nếu có
      };
      console.log("[LOG][FE] Gửi yêu cầu tạo đơn hàng:", orderData);
      const res = await createOrder(orderData);
      console.log("[LOG][FE] Kết quả tạo đơn hàng:", res.data);
      if (paymentMethod === "COD") {
        if (res.data.order?._id) {
          // Sau khi tạo order COD thành công, lấy lại chi tiết order từ BE
          const orderRes = await getOrder(res.data.order._id);
          setOrderInfo(orderRes.data);
        }
        setLoading(false);
        setSuccessMessage("Đặt hàng thành công! Đang chuyển về trang chủ...");
        
        // Clear cart khi thanh toán COD thành công
        try {
          await cartAPI.clearCart();
          localStorage.removeItem("cart");
          localStorage.removeItem("cart_backup");
          window.dispatchEvent(new Event("cart-updated"));
        } catch (error) {
          console.error("Lỗi khi clear cart:", error);
        }
        
        setTimeout(() => {
          navigate("/");
        }, 5000);
        return;
      } else if (res.data.paymentUrl && res.data.orderId) {
        // Trước khi redirect, lấy lại chi tiết order để hiển thị tổng tiền đúng
        const orderRes = await getOrder(res.data.orderId);
        setOrderInfo(orderRes.data);
        window.location.href = res.data.paymentUrl;
        // ĐÃ BỎ throw new Error("Backend không trả về paymentUrl");
        return;
      }
    } catch (error) {
      console.error(`=== [PACEUPSHOP][FE] ${paymentMethod.toUpperCase()} ERROR ===`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
      alert(`Lỗi khi tạo thanh toán: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  }, 1000);

  const handlePayment = () => {
    setLoading(true);
    debouncedHandlePayment();
  };

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-700">{successMessage}</h2>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <button
            onClick={() => navigate("/cart")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Thanh toán</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">📦</span>Sản phẩm ({cart.items.length})
              </h2>
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={
                        Array.isArray(item.product?.imageurl) && item.product.imageurl[0]
                          ? item.product.imageurl[0]
                          : item.product?.images?.[0] || "https://via.placeholder.com/100"
                      }
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.product?.name}</h3>
                      <p className="text-sm text-gray-600">Size: {Array.isArray(item.size) ? item.size.join(", ") : item.size}</p>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {item.product?.discount_price != null && item.product.discount_price < item.price ? (
                          <>
                            <span>{(item.product.discount_price * item.quantity).toLocaleString("vi-VN")} ₫</span>
                            <span className="text-gray-400 text-base line-through ml-2">{(item.price * item.quantity).toLocaleString("vi-VN")} ₫</span>
                          </>
                        ) : (
                          <span>{(item.price * item.quantity).toLocaleString("vi-VN")} ₫</span>
                        )}
                      </p>
                      <div className="text-sm text-gray-500">
                        {item.quantity} × {item.product?.discount_price != null && item.product.discount_price < item.price
                          ? item.product.discount_price.toLocaleString("vi-VN")
                          : item.price?.toLocaleString("vi-VN")
                        }₫
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">💳</span>Phương thức thanh toán
              </h2>
              {/* Voucher input */}
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Mã giảm giá (Voucher):</label>
                <div className="flex gap-2 items-stretch w-full">
                  <input
                    type="text"
                    value={voucher}
                    onChange={e => setVoucher(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 h-12 focus:ring-2 focus:ring-indigo-400 transition min-w-0"
                    placeholder="Nhập mã voucher"
                    disabled={voucherLoading}
                  />
                  <button
                    onClick={async () => {
                      setVoucherLoading(true);
                      setVoucherError("");
                      setVoucherInfo(null);
                      try {
                        console.log("[LOG][FE] Đang validate voucher:", voucher, cart.subtotal);
                        const res = await validateVoucher(voucher, cart.subtotal);
                        console.log("[LOG][FE] Kết quả validate voucher:", res.data);
                        if (res.data?.success && res.data.data?.code) {
                          setVoucherInfo(res.data.data); // Chỉ set khi mã hợp lệ
                        } else {
                          setVoucherError(res.data?.message || "Voucher không hợp lệ");
                          setVoucherInfo(null); // Không set nếu không hợp lệ
                        }
                      } catch (err) {
                        setVoucherError("Có lỗi khi kiểm tra voucher");
                        setVoucherInfo(null);
                        console.error("[LOG][FE] Lỗi validate voucher:", err);
                      }
                      setVoucherLoading(false);
                    }}
                    className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-green-500 text-white px-3 h-12 rounded-full font-semibold shadow-md hover:from-indigo-600 hover:to-green-600 transition-all duration-200 active:scale-95 text-sm shrink-0 w-auto"
                    disabled={voucherLoading || !voucher}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <span role="img" aria-label="voucher" style={{ fontSize: 16 }}>🎟️</span>
                    <span className="hidden sm:inline">Áp dụng</span>
                    <span className="inline sm:hidden">Dùng</span>
                  </button>
                </div>
                {voucherError && <div className="text-red-500 mt-1">{voucherError}</div>}
                {voucherInfo && (
                  <div className="text-green-600 mt-1">
                    Đã áp dụng voucher: {voucherInfo.code} - 
                    {voucherInfo.discount_type === 'percent'
                      ? `Giảm ${voucherInfo.discount_value}%`
                      : `Giảm ${voucherInfo.discount.toLocaleString("vi-VN")}₫`}
                  </div>
                )}
              </div>
              {/* End voucher input */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPay"
                    checked={paymentMethod === "VNPay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="h-6 w-16 mr-2 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">
                      VNPAY
                    </div>
                    <span>VNPay (Thẻ ngân hàng)</span>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ZaloPay"
                    checked={paymentMethod === "ZaloPay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-green-600 font-semibold mr-2">ZaloPay</span>
                    <span>Ví điện tử ZaloPay</span>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-orange-600 font-semibold mr-2">COD</span>
                    <span>Thanh toán khi nhận hàng</span>
                  </div>
                </label>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{orderInfo ? orderInfo.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("vi-VN") : cart.subtotal?.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="text-green-600 font-semibold">Miễn phí</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-semibold text-gray-800">
                    <span>Tổng cộng:</span>
                    <span>{orderInfo ? orderInfo.totalAmount.toLocaleString("vi-VN") : (cart.subtotal - (voucherInfo?.discount || 0)).toLocaleString("vi-VN")} ₫</span>
                  </div>
                  {orderInfo && orderInfo.discount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Đã giảm giá:</span>
                      <span>-{orderInfo.discount.toLocaleString("vi-VN")} ₫</span>
                    </div>
                  )}
                  {!orderInfo && voucherInfo && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Đã giảm giá:</span>
                      <span>-{voucherInfo.discount.toLocaleString("vi-VN")} ₫</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 mt-6"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    Thanh toán ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}