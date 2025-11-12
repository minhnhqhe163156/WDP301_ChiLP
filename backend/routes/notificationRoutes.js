const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware.verifyToken, notificationController.createNotification);
router.get('/', authMiddleware.verifyToken, notificationController.getNotifications);
router.put('/:id/read', authMiddleware.verifyToken, notificationController.markAsRead);
router.put('/read-all', authMiddleware.verifyToken, notificationController.markAllAsRead);
router.delete('/:id', authMiddleware.verifyToken, notificationController.deleteNotification);

module.exports = router;