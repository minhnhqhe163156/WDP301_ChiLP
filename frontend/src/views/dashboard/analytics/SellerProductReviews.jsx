import React, { useEffect, useState } from "react";
import { getSellerProductReviews, replyToFeedback } from "../../../api/reviewApi";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  BarChart2,
  Truck,
  Users,
  PlusCircle,
  Package,
  Briefcase,
  Bell,
  LogOut,
} from "lucide-react";
import "../../../styles/Dashboard.css";

const SellerProductReviews = () => {
  const { user } = useAuth();
  const sellerId = user?._id;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();
  const [replyInputs, setReplyInputs] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [replyError, setReplyError] = useState({});

  useEffect(() => {
    if (!sellerId) {
      setLoading(false);
      return;
    }
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getSellerProductReviews(sellerId);
        setReviews(data);
      } catch {
        setReviews([]);
      }
      setLoading(false);
    };
    fetchReviews();
  }, [sellerId]);

  // Phân trang
  const totalPages = Math.ceil(reviews.length / pageSize);
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Hàm gửi phản hồi
  const handleReply = async (reviewId) => {
    const content = replyInputs[reviewId]?.trim();
    if (!content) return;
    setReplyLoading((prev) => ({ ...prev, [reviewId]: true }));
    setReplyError((prev) => ({ ...prev, [reviewId]: null }));
    try {
      await replyToFeedback(reviewId, content);
      // Sau khi gửi thành công, reload lại reviews
      const data = await getSellerProductReviews(sellerId);
      setReviews(data);
      setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
    } catch {
      setReplyError((prev) => ({ ...prev, [reviewId]: "Gửi phản hồi thất bại" }));
    }
    setReplyLoading((prev) => ({ ...prev, [reviewId]: false }));
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Đánh giá sản phẩm đã bán</h2>
        <div>Bạn cần đăng nhập với tài khoản seller để xem trang này.</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar giống SellerDashboard */}
      <aside className="w-64 bg-gradient-to-b from-indigo-600 to-purple-600 text-white min-h-screen p-6">
        <div className="flex items-center gap-2 mb-8">
          <Briefcase size={24} />
          <span className="font-bold text-lg">Bảng điều khiển</span>
        </div>
        <nav className="flex flex-col gap-4">
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/analytics")}
          >
            <BarChart2 size={20} /> Phân Tích cửa hàng
          </button>
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/order-management")}
          >
            <Truck size={20} /> Quản Lí Đơn hàng
          </button>
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/reviews")}
          >
            <Users size={20} /> Quản Lí Feedback
          </button>
          <button
            onClick={() => navigate("/seller/categories")}
            className="flex items-center gap-2 hover:underline"
          >
            <PlusCircle size={20} /> Quản Lý Danh Mục
          </button>
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/products")}
          >
            <PlusCircle size={20} /> Quản Lí Sản Phẩm
          </button>
          <button
            className="flex items-center gap-2 hover:underline"
            onClick={() => navigate("/seller/categories")}
          >
            <Package size={20} /> Quản Lí Danh Mục
          </button>
        </nav>
      </aside>

      {/* Main content giống SellerDashboard */}
      <div className="seller-dashboard min-h-screen bg-gradient-to-br from-slate-50 to-white flex-1">
        {/* Header */}
        <div className="header-container flex justify-between items-center px-6 py-4 rounded-b-xl mb-6 relative bg-transparent">
          <div className="flex items-center gap-4 z-10">
            <Briefcase size={32} className="text-white" />
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                Đánh giá sản phẩm đã bán
              </h1>
              <p className="text-white/90">
                Xem phản hồi của khách hàng về sản phẩm của bạn
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 z-10">
            <button className="notification-btn relative">
              <Bell size={20} />
            </button>
            <button
              className="logout-btn flex items-center gap-1"
              onClick={() => console.log("Logout clicked")}
            >
              <LogOut size={18} /> <span>Đăng xuất</span>
            </button>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -z-0" />
        </div>

        {/* Nội dung review */}
        <div className="max-w-4xl mx-auto px-4 pb-12">
          {loading ? (
            <div className="text-center text-gray-600">Đang tải...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-500">Chưa có đánh giá nào cho sản phẩm của bạn.</div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedReviews.map((review) => (
                  <div
                    key={review._id}
                    className="flex flex-col gap-2 bg-white rounded-lg shadow p-4 dashboard-card"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          review.product_id?.imageurl?.[0] ||
                          "https://via.placeholder.com/60"
                        }
                        alt={review.product_id?.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            {review.product_id?.product_name}
                          </span>
                          <span className="text-yellow-500 font-bold">
                            {"★".repeat(review.rating)}
                          </span>
                        </div>
                        <div className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                          {review.user_id?.picture_avatar && (
                            <img
                              src={review.user_id.picture_avatar}
                              alt={review.user_id.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          Người đánh giá: {review.user_id?.name}
                        </div>
                        <div className="text-gray-800 mb-1">{review.comment}</div>
                        <div className="text-xs text-gray-400">
                          {review.created_at
                            ? new Date(review.created_at).toLocaleString("vi-VN")
                            : ""}
                        </div>
                      </div>
                    </div>
                    {/* Phản hồi của seller */}
                    {review.reply ? (
                      <div className="ml-20 mt-2 p-3 bg-gray-50 border-l-4 border-blue-400 rounded">
                        <div className="text-sm text-blue-700 font-semibold mb-1">Phản hồi của shop:</div>
                        <div className="text-gray-800">{review.reply.content}</div>
                      </div>
                    ) : (
                      <div className="ml-20 mt-2">
                        <textarea
                          className="w-full border rounded p-2 text-sm"
                          rows={2}
                          placeholder="Nhập phản hồi cho khách hàng..."
                          value={replyInputs[review._id] || ""}
                          onChange={(e) => setReplyInputs((prev) => ({ ...prev, [review._id]: e.target.value }))}
                          disabled={replyLoading[review._id]}
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
                            onClick={() => handleReply(review._id)}
                            disabled={replyLoading[review._id] || !(replyInputs[review._id]?.trim())}
                          >
                            {replyLoading[review._id] ? "Đang gửi..." : "Gửi phản hồi"}
                          </button>
                          {replyError[review._id] && (
                            <span className="text-red-500 text-xs">{replyError[review._id]}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProductReviews;
