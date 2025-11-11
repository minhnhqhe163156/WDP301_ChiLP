import api from "./api"; // hoặc đường dẫn tới axios instance của bạn

export const getSellerProductReviews = async (sellerId) => {
  const res = await api.get(`/review/seller/${sellerId}`);
  return res.data;
};

export const replyToFeedback = async (feedback_id, content) => {
  const res = await api.post("/feedback/reply", { feedback_id, content });
  return res.data;
};
