const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, statisticsController.generateStatistics);
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, statisticsController.getStatistics);

module.exports = router;