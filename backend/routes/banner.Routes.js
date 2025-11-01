const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/Banner.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const { bannerUpload } = require('../middlewares/upload.middleware');

router.get('/banners', bannerController.getBanners);
router.post('/banners', authMiddleware.verifyToken, bannerUpload.single('image'), bannerController.createBanner);
router.put('/banners/:id', authMiddleware.verifyToken, bannerUpload.single('image'), bannerController.updateBanner);
router.delete('/banners/:id', authMiddleware.verifyToken, bannerController.deleteBanner);

module.exports = router;