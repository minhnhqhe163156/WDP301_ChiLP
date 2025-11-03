import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { orderAPI } from "../../api/api";
import { reviewAPI } from "../../api/api";
import toast from "react-hot-toast";
import axios from "axios";

function ConfirmModal({ show, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Xác nhận hủy đơn hàng
        </h2>
        <p className="mb-6 text-gray-600">Bạn có chắc muốn hủy đơn hàng này?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400"
          >
            Không
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            Hủy đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);
  const [reviewedMap, setReviewedMap] = useState({}); // {orderId: {productId: true}}
  const [showReviewForm, setShowReviewForm] = useState({}); // {orderId_productId: true}
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getMyOrders();
      if (res.data.success) {
        setOrders(res.data.orders);
      } else {
        toast.error("Không thể tải danh sách đơn hàng!");
      }
    } catch (error) {
      console.error(
        "Error fetching orders:",
        error.response?.data || error.message
      );
      toast.error("Lỗi khi tải danh sách đơn hàng: " + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && user.role === "customer") {
      fetchOrders();
    } else {
      toast.error("Bạn cần đăng nhập với vai trò khách hàng!");
      navigate("/loginandregister");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchReviewed = async () => {
      const map = {};
      for (const order of orders) {
        if (order.orderStatus === "Delivered") {
          try {
            const res = await axios.get(`/api/review/order/${order._id}`);
            map[order._id] = {};
            res.data.forEach((r) => {
              map[order._id][r.product_id] = true;
            });
          } catch {}
        }
      }
      setReviewedMap(map);
    };
    if (orders.length > 0) fetchReviewed();
  }, [orders]);

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await orderAPI.cancelOrder(orderId);
      if (res.data.success) {
        toast.success("Đã hủy đơn hàng thành công!");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, ...res.data.order } : order
          )
        );
      } else {
        toast.error("Không thể hủy đơn hàng: " + res.data.message);
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("Lỗi khi hủy đơn hàng: " + error.message);
    }
    setShowConfirm(false);
    setPendingCancelId(null);
  };

  const handleConfirmReceived = async (orderId) => {
    try {
      const res = await orderAPI.confirmReceived(orderId);
      if (res.data.success) {
        toast.success("Đã xác nhận nhận hàng thành công!");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  ...res.data.order,
                  orderStatus: "Delivered",
                  items: order.items, // Preserve original items array
                }
              : order
          )
        );
      } else {
        toast.error("Không thể xác nhận nhận hàng: " + res.data.message);
      }
    } catch (error) {
      console.error("Error confirming received:", error);
      toast.error("Lỗi khi xác nhận nhận hàng: " + error.message);
    }
  };

  const handleOpenReviewForm = (orderId, productId) => {
    setShowReviewForm((f) => ({ ...f, [`${orderId}_${productId}`]: true }));
    setReviewForm({ rating: 5, comment: "" });
  };
  const handleCloseReviewForm = (orderId, productId) => {
    setShowReviewForm((f) => ({ ...f, [`${orderId}_${productId}`]: false }));
  };
  const handleSubmitReview = async (orderId, productId) => {
    setReviewSubmitting(true);
    try {
      await reviewAPI.createReview({
        product_id: productId,
        order_id: orderId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewedMap((m) => ({
        ...m,
        [orderId]: { ...m[orderId], [productId]: true },
      }));
      setShowReviewForm((f) => ({ ...f, [`${orderId}_${productId}`]: false }));
      toast.success("Đánh giá thành công!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể gửi đánh giá");
    }
    setReviewSubmitting(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Lịch sử đơn hàng
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              Chưa có đơn hàng
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Quay về trang chủ
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Mã đơn hàng: {order._id}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Ngày đặt: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-800">
                      Tổng tiền: {order.totalAmount.toLocaleString("vi-VN")} ₫
                    </p>
                    <p className="text-sm text-gray-600">
                      Phương thức: {order.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-600">
                      Trạng Thái Thanh Toán: {order.paymentStatus}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        order.orderStatus === "Delivered"
                          ? "text-green-600"
                          : order.orderStatus === "Cancelled"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    >
                      Trạng thái: {order.orderStatus}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  {order.items.map((item, index) => {
                    console.log(`Order ${order._id}, Item ${index}:`, {
                      product: item.productId,
                      populatedProduct: item.productId
                        ? {
                            name: item.productId.product_name,
                            imageurl: item.productId.imageurl,
                          }
                        : null,
                      itemData: item,
                    });

                    const product = item.productId;
                    const imageUrl =
                      Array.isArray(product?.imageurl) &&
                      product.imageurl.length > 0
                        ? product.imageurl[0]
                        : product?.images?.[0] ||
                          "https://via.placeholder.com/100";
                    const productName =
                      product?.product_name || "Tên sản phẩm không rõ";

                    const reviewed =
                      reviewedMap[order._id]?.[
                        item.productId?._id || item.productId
                      ];
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                      >
                        <img
                          src={imageUrl}
                          alt={productName}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100";
                            console.error(
                              `Image failed for item ${index}:`,
                              imageUrl
                            );
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {productName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Số lượng: {item.quantity}
                          </p>
                          <p className="text-sm text-gray-600">
                            Giá: {item.price.toLocaleString("vi-VN")} ₫
                          </p>
                        </div>
                        <p className="font-semibold text-gray-800">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}{" "}
                          ₫
                        </p>
                        {order.orderStatus === "Delivered" && !reviewed && (
                          <button
                            onClick={() =>
                              handleOpenReviewForm(
                                order._id,
                                item.productId?._id || item.productId
                              )
                            }
                            style={{
                              backgroundColor: "#FFD600",
                              color: "black",
                            }}
                            className="px-3 py-1 rounded-lg font-semibold hover:bg-yellow-500 transition mt-2"
                          >
                            Đánh giá sản phẩm
                          </button>
                        )}
                        {order.orderStatus === "Delivered" && reviewed && (
                          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg font-semibold">
                            Đã đánh giá
                          </span>
                        )}
                        {showReviewForm[
                          `${order._id}_${item.productId?._id || item.productId}`
                        ] && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSubmitReview(
                                order._id,
                                item.productId?._id || item.productId
                              );
                            }}
                            className="mt-2 bg-white rounded-xl p-4 shadow space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              {[...Array(5)].map((_, i) => (
                                <button
                                  type="button"
                                  key={i}
                                  onClick={() =>
                                    setReviewForm((f) => ({
                                      ...f,
                                      rating: i + 1,
                                    }))
                                  }
                                >
                                  <span
                                    className={`w-6 h-6 inline-block ${i < reviewForm.rating ? "text-yellow-400" : "text-gray-300"}`}
                                  >
                                    ★
                                  </span>
                                </button>
                              ))}
                              <span className="ml-2 text-lg font-semibold">
                                {reviewForm.rating} sao
                              </span>
                            </div>
                            <textarea
                              className="w-full border rounded-lg p-2"
                              rows={2}
                              placeholder="Nhận xét của bạn..."
                              value={reviewForm.comment}
                              onChange={(e) =>
                                setReviewForm((f) => ({
                                  ...f,
                                  comment: e.target.value,
                                }))
                              }
                              required
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                type="submit"
                                style={{
                                  backgroundColor: "#4F46E5",
                                  color: "white",
                                  padding: "4px 16px",
                                  borderRadius: "0.5rem",
                                  fontWeight: 600,
                                }}
                                className="hover:bg-indigo-700 transition"
                                disabled={reviewSubmitting}
                              >
                                {reviewSubmitting
                                  ? "Đang gửi..."
                                  : "Gửi đánh giá"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCloseReviewForm(
                                    order._id,
                                    item.productId?._id || item.productId
                                  )
                                }
                                className="bg-gray-300 text-gray-800 px-4 py-1 rounded-lg font-semibold hover:bg-gray-400 transition"
                              >
                                Hủy
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 border-t pt-4">
                  <h3 className="font-semibold text-gray-800">
                    Địa chỉ giao hàng
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tên: {order.shipping_address.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Số điện thoại: {order.shipping_address.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    Địa chỉ: {order.shipping_address.address}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Xem chi tiết
                  </button>
                  {order.orderStatus === "Shipping" && (
                    <button
                      onClick={() => handleConfirmReceived(order._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Đã nhận được hàng
                    </button>
                  )}
                  {/* {order.orderStatus === "Delivered" && (
                    <button
                      onClick={() => navigate(`/orders/${order._id}/review`)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
                    >
                      Đánh giá sản phẩm
                    </button>
                  )} */}
                  {["Pending", "Processing"].includes(order.orderStatus) && (
                    <button
                      onClick={() => {
                        setShowConfirm(true);
                        setPendingCancelId(order._id);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmModal
        show={showConfirm}
        onCancel={() => {
          setShowConfirm(false);
          setPendingCancelId(null);
        }}
        onConfirm={() => pendingCancelId && handleCancelOrder(pendingCancelId)}
      />
    </div>
  );
}
