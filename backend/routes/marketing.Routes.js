const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const authMiddleware = require('../middlewares/authMiddleware');
const { blogUpload, bannerUpload } = require('../middlewares/upload.middleware');

// Public GET blogs
router.get('/blogs', marketingController.getBlogs);
router.get('/blogs/count', marketingController.getBlogCount);
router.get('/blogs/:id', marketingController.getBlogById);
router.get('/banners', marketingController.getBanners);
router.get('/banners/count', marketingController.getBannerCount);
// Bảo vệ các route còn lại
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.checkRole(['marketing_staff']));


router.post(
  '/banners',
  bannerUpload.single('image'),
  marketingController.createBanner
);
router.put(
  '/banners/:id',
  bannerUpload.single('image'),
  marketingController.updateBanner
);
router.delete('/banners/:id', marketingController.deleteBanner);

// Blogs
// This route is mounted as /api/marketing/blogs
router.post(
  '/blogs',
  authMiddleware.verifyToken,
  blogUpload.single('featured_image'),
  marketingController.createBlog
);
router.put(
  '/blogs/:id',
  authMiddleware.verifyToken,
  blogUpload.single('featured_image'),
  marketingController.updateBlog
);
router.delete('/blogs/:id', marketingController.deleteBlog);

// Promotions
router.get('/promotions', marketingController.getPromotions);
router.post('/promotions', marketingController.createPromotion); // Đã có verifyToken ở trên router.use
router.put('/promotions/:id', marketingController.updatePromotion);
router.delete('/promotions/:id', marketingController.deletePromotion);

module.exports = router;