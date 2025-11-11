const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, shippingController.createShipping);
router.get('/:orderId', authMiddleware.verifyToken, shippingController.getShipping);
router.put('/:orderId/status', authMiddleware.verifyToken, authMiddleware.isAdmin, shippingController.updateShippingStatus);

module.exports = router;