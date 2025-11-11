const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User'); // Added User model import

exports.createReview = async (req, res) => {
  const { product_id, order_id, rating, comment } = req.body;
  try {
    // Kiểm tra order đã Delivered chưa
    const order = await Order.findById(order_id);
    if (!order || order.userId.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Order not found or not owned by user' });
    }
    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ message: 'Order must be Delivered to review' });
    }
    // Kiểm tra đã review sản phẩm này trong order này chưa
    const existed = await Review.findOne({ product_id, order_id, user_id: req.user._id });
    if (existed) {
      return res.status(400).json({ message: 'You have already reviewed this product in this order' });
    }
    const review = new Review({
      product_id,
      user_id: req.user._id,
      order_id,
      rating,
      comment,
    });
    await review.save();

    const reviews = await Review.find({ product_id });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(product_id, {
      averageRating,
      totalReviews: reviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId })
      .populate({ path: 'user_id', select: 'name avatar' });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy review theo user
exports.getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.params.userId }).populate('product_id order_id');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy review theo order
exports.getReviewsByOrder = async (req, res) => {
  try {
    const reviews = await Review.find({ order_id: req.params.orderId }).populate('product_id user_id');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy tất cả review cho các sản phẩm của seller
exports.getReviewsBySeller = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm của seller
    const products = await Product.find({ seller_id: req.params.sellerId }, '_id');
    const productIds = products.map(p => p._id);

    // Lấy tất cả review của các sản phẩm này
    const reviews = await Review.find({ product_id: { $in: productIds } })
      .populate({ path: 'user_id', select: 'name picture_avatar' })
      .populate({ path: 'product_id', select: 'product_name imageurl' });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Sửa review (chỉ chủ review)
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { rating, comment } = req.body;
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Xóa review (chỉ chủ review)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await review.remove();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy tổng điểm trung bình, tổng số review cho sản phẩm
exports.getReviewSummaryByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;
    res.json({ totalReviews, averageRating });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy review theo email
exports.getReviewsByUserEmail = async (req, res) => {
  try {
    const email = req.params.email;
    // Tìm tất cả user có email này
    const users = await User.find({ email });
    const userIds = users.map(u => u._id);
    // Lấy tất cả review của các user này
    const reviews = await Review.find({ user_id: { $in: userIds } });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};