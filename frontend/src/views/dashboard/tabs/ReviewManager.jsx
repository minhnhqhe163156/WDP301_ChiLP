import React, { useEffect, useState } from "react";
import { reviewAPI } from "../../../api/api";
import { useAuth } from "../../../contexts/AuthContext";

export default function ReviewManager() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]); // [{product_id, rating, comment, ...}]
  const [editing, setEditing] = useState(null); // reviewId đang chỉnh sửa
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user?._id) {
          const reviewRes = await reviewAPI.getReviewByUser(user._id);
          setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
        }
      } catch {
        setReviews([]);
      }
      setLoading(false);
    };
    if (user?._id) fetchData();
  }, [user]);

  // Bắt đầu sửa review
  const handleEdit = (review) => {
    setEditing(review._id);
    setForm({ rating: review.rating, comment: review.comment });
  };

  // Gửi cập nhật review
  const handleSubmit = async (e) => {
    e.preventDefault();
    const review = reviews.find(r => r._id === editing);
    if (!review) return;
    try {
      await reviewAPI.updateReview(review._id, {
        rating: form.rating,
        comment: form.comment
      });
      // Refresh
      const reviewRes = await reviewAPI.getReviewByUser(user._id);
      setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
      setEditing(null);
      setForm({ rating: 5, comment: "" });
    } catch {
      alert("Lưu đánh giá thất bại!");
    }
  };

  // Xóa review
  const handleDelete = async (reviewId) => {
    try {
      await reviewAPI.deleteReview(reviewId);
      // Refresh
      const reviewRes = await reviewAPI.getReviewByUser(user._id);
      setReviews(Array.isArray(reviewRes.data) ? reviewRes.data : []);
    } catch {
      alert("Xóa đánh giá thất bại!");
    }
  };

  // Hàm lấy ảnh sản phẩm đúng chuẩn
  const getProductImage = (product) => {
    if (!product) return "https://via.placeholder.com/60";
    if (Array.isArray(product.imageurl) && product.imageurl.length > 0) {
      return product.imageurl[0];
    }
    if (typeof product.imageurl === "string" && product.imageurl) {
      return product.imageurl;
    }
    return "https://via.placeholder.com/60";
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div>
      <h4>Đánh giá của bạn</h4>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {reviews.length === 0 && <li>Bạn chưa có đánh giá nào.</li>}
        {reviews.map(review => {
          const product = review.product_id;
          if (!product) return null;
          return (
            <li key={review._id} style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
              <img
                src={getProductImage(product)}
                alt={product.product_name || "Sản phẩm"}
                width={60}
                height={60}
                style={{ objectFit: "cover", borderRadius: 8, marginRight: 12, border: "1px solid #eee" }}
                onError={e => (e.target.src = "https://via.placeholder.com/60")}
              />
              <div style={{ flex: 1 }}>
                <b>{product.product_name || "Sản phẩm"}</b>
                <span style={{ marginLeft: 8 }}>
                  - {review.rating}★ - {review.comment}
                </span>
                <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => handleEdit(review)}>Sửa</button>
                <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleDelete(review._id)}>Xóa</button>
              </div>
            </li>
          );
        })}
      </ul>
      {editing && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 400, marginTop: 16 }}>
          <select
            name="rating"
            value={form.rating}
            onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
            className="form-control mb-2"
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>{n}★</option>
            ))}
          </select>
          <input
            name="comment"
            placeholder="Nhận xét"
            value={form.comment}
            onChange={e => setForm({ ...form, comment: e.target.value })}
            className="form-control mb-2"
          />
          <button type="submit" className="btn btn-primary">Lưu đánh giá</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => setEditing(null)}>Hủy</button>
        </form>
      )}
    </div>
  );
} 