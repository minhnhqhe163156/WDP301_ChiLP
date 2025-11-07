import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../../store/Reducers/cartReducer";
import { cartAPI } from "../../api/api";
import { getOrder } from "../../api/orderApi";
export default function CheckoutSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");
  const paymentMethod = params.get("paymentMethod");
  const amount = params.get("amount");
  const status = params.get("status");

  console.log("=== [DEBUG][FE] orderId trên URL:", orderId); // Log để kiểm tra orderId

  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(null);

  const [isPolling, setIsPolling] = useState(false);
  const pollCount = useRef(0);
  const maxPolls = 10;
  const pollInterval = 2000;

  // Đặt flag để biết có cần dọn dẹp giỏ hàng không
  const shouldClearCart = status === "1";
  useEffect(() => {
    if (shouldClearCart) {
      cartAPI.clearCart();
      localStorage.removeItem("cart");
      localStorage.removeItem("cart_backup");
      dispatch(clearCart());
    }
  }, [shouldClearCart, dispatch]);

  useEffect(() => {
    const checkOrderStatus = () => {
      if (!orderId) {
        console.error(
          "=== [DEBUG][FE] orderId không tồn tại, không thể kiểm tra trạng thái."
        );
        setLoading(false);
        setError("Không tìm thấy mã đơn hàng trong URL.");
        return;
      }

      console.log(
        `=== [PACEUPSHOP][FE] Kiểm tra trạng thái đơn hàng (lần ${
          pollCount.current + 1
        }):`,
        { orderId }
      );

      getOrder(orderId)
        .then((res) => {
          console.log("=== [DEBUG][FE] API /orders/:id trả về:", res.data);
          const currentStatus = res.data.paymentStatus;
          setOrderStatus(currentStatus);

          if (currentStatus === "Completed") {
            setIsPolling(false);
            setLoading(false);
            console.log(
              "=== [PACEUPSHOP][FE] Thanh toán thành công, đã dọn dẹp giỏ hàng."
            );
          } else if (currentStatus === "Pending" && paymentMethod !== "COD") {
            pollCount.current += 1;
            if (pollCount.current < maxPolls) {
              setIsPolling(true);
              setTimeout(checkOrderStatus, pollInterval);
            } else {
              setIsPolling(false);
              setLoading(false);
              setError(
                "Giao dịch mất quá nhiều thời gian để xử lý. Vui lòng kiểm tra lại sau."
              );
            }
          } else {
            setIsPolling(false);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("=== [DEBUG][FE] Lỗi khi kiểm tra đơn hàng:", {
            orderId,
            status: err.response?.status,
            message: err.message,
            data: err.response?.data,
          });
          setError(
            err.response?.data?.message ||
              "Không thể kiểm tra trạng thái đơn hàng"
          );
          setIsPolling(false);
          setLoading(false);
        });
    };

    if (orderId) {
      checkOrderStatus();
    } else {
      setLoading(false);
      setError("Không tìm thấy orderId trong URL.");
    }
  }, [orderId, dispatch, paymentMethod]);

  if (loading || isPolling || orderStatus === "Pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Đang xác nhận thanh toán...
            <br />
            Vui lòng chờ 5-20 giây để hệ thống xác nhận giao dịch với ngân hàng.
          </p>
          {orderId && (
            <p className="mt-2 text-gray-500">Mã đơn hàng: {orderId}</p>
          )}
          {pollCount.current >= maxPolls && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Thử lại kiểm tra trạng thái
            </button>
          )}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <svg
            className="mx-auto mb-4 w-16 h-16 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <line
              x1="8"
              y1="8"
              x2="16"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="16"
              y1="8"
              x2="8"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2 text-red-700">
            Lỗi kiểm tra đơn hàng
          </h2>
          <p className="text-gray-700">{error}</p>
          {orderId && (
            <p className="mt-2 text-gray-500">Mã đơn hàng: {orderId}</p>
          )}
          <button
            onClick={() => navigate("/cart")}
            className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  if (orderStatus === "Failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <svg
            className="mx-auto mb-4 w-16 h-16 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <line
              x1="8"
              y1="8"
              x2="16"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="16"
              y1="8"
              x2="8"
              y2="16"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2 text-red-700">
            Thanh toán thất bại!
          </h2>
          <p className="text-gray-700">
            Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </p>
          {orderId && (
            <p className="mt-2 text-gray-500">Mã đơn hàng: {orderId}</p>
          )}
          <button
            onClick={() => navigate("/cart")}
            className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  if (status === "1") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <svg
            className="mx-auto mb-4 w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2 text-green-700">
            Thanh toán thành công!
          </h2>
          <p className="text-gray-700">Cảm ơn bạn đã mua hàng tại shop.</p>
          {orderId && (
            <p className="mt-2 text-gray-500">Mã đơn hàng: {orderId}</p>
          )}
          {paymentMethod && (
            <p className="mt-2 text-gray-500">
              Phương thức thanh toán: {paymentMethod}
            </p>
          )}
          {amount && (
            <p className="mt-2 text-gray-500">
              Số tiền: {parseInt(amount).toLocaleString("vi-VN")} ₫
            </p>
          )}
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (status === "0") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <svg className="mx-auto mb-4 w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold mb-2 text-red-700">
            Thanh toán thất bại!
          </h2>
          <p className="text-gray-700">
            Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </p>
          <button>Quay lại giỏ hàng</button>
        </div>
      </div>
    );
  }

  if (orderStatus === "Completed" || paymentMethod === "COD") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <svg
            className="mx-auto mb-4 w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2 text-green-700">
            Thanh toán thành công!
          </h2>
          <p className="text-gray-700">Cảm ơn bạn đã mua hàng tại shop.</p>
          {orderId && (
            <p className="mt-2 text-gray-500">Mã đơn hàng: {orderId}</p>
          )}
          {paymentMethod && (
            <p className="mt-2 text-gray-500">
              Phương thức thanh toán: {paymentMethod}
            </p>
          )}
          {amount && (
            <p className="mt-2 text-gray-500">
              Số tiền: {parseInt(amount).toLocaleString("vi-VN")} ₫
            </p>
          )}
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-amber-500-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }
}
