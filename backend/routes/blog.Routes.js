const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const authMiddleware = require('../middlewares/authMiddleware');
const { blogUpload } = require('../middlewares/upload.middleware');

// Public GET blogs (đặt TRƯỚC middleware xác thực)
router.get('/blogs', marketingController.getBlogs);
router.get('/blogs/count', marketingController.getBlogCount);

// Các route dưới đây mới cần xác thực và phân quyền
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkRole(['marketing_staff']));

router.post(
  '/blogs',
  blogUpload.single('featured_image'),
  marketingController.createBlog
);
router.put(
  '/blogs/:id',
  blogUpload.single('featured_image'),
  marketingController.updateBlog
);

module.exports = router;
