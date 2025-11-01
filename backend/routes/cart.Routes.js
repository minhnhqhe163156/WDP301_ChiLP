const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Get user's cart
router.get('/', authMiddleware.verifyToken, cartController.getCart);

// Add item to cart
router.post('/add', authMiddleware.verifyToken, cartController.addToCart);

// Update item quantity
router.put('/items/:itemId', authMiddleware.verifyToken, cartController.updateQuantity);

// Remove item from cart
router.delete('/items/:itemId', authMiddleware.verifyToken, cartController.removeItem);

// Clear cart
router.delete('/', authMiddleware.verifyToken, cartController.clearCart);

// Get cart count
router.get('/count', authMiddleware.verifyToken, cartController.getCartCount);

module.exports = router;