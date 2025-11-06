const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware.verifyToken, authMiddleware.isCustomer, wishlistController.addToWishlist);
router.get('/', authMiddleware.verifyToken, authMiddleware.isCustomer, wishlistController.getWishlist);
router.get('/user-email/:email', wishlistController.getWishlistByUserEmail);
router.delete('/:productId', authMiddleware.verifyToken, authMiddleware.isCustomer, wishlistController.removeFromWishlist);

module.exports = router;