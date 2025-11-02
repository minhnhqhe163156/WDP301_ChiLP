const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/upload.middleware');

router.get('/suggestions', productController.getKeywordSuggestions);

router.get('/', productController.getProducts);
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.isSeller,
  uploadMiddleware.productUpload.array('images', 10), 
  productController.createProduct
);

router.get('/test', productController.testConnection);

router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isSeller,
  uploadMiddleware.productUpload.array('images', 10), 
  productController.updateProduct
);

router.get('/:id', productController.getProductById);
router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isSeller,
  productController.deleteProduct
);

module.exports = router;
