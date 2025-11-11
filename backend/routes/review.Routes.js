const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware.verifyToken, authMiddleware.isCustomer, reviewController.createReview);
router.get('/product/:productId', reviewController.getReviewsByProduct);
// Lấy review theo user
router.get('/user/:userId', reviewController.getReviewsByUser);
// Lấy review theo order
router.get('/order/:orderId', reviewController.getReviewsByOrder);
// Lấy tất cả review cho các sản phẩm của seller
router.get('/seller/:sellerId', reviewController.getReviewsBySeller);
// Lấy review theo email
router.get('/user-email/:email', reviewController.getReviewsByUserEmail);
// Sửa review (chỉ chủ review)
router.put('/:reviewId', authMiddleware.verifyToken, authMiddleware.isCustomer, reviewController.updateReview);
// Xóa review (chỉ chủ review)
router.delete('/:reviewId', authMiddleware.verifyToken, authMiddleware.isCustomer, reviewController.deleteReview);
// Lấy tổng điểm trung bình, tổng số review cho sản phẩm
router.get('/product/:productId/summary', reviewController.getReviewSummaryByProduct);

module.exports = router;