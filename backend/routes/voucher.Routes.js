const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware.verifyToken, authMiddleware.checkRole(['marketing_staff', 'admin']), voucherController.createVoucher);
router.get('/', voucherController.getVouchers);
router.get('/count', voucherController.getVoucherCount);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.checkRole(['marketing_staff', 'admin']), voucherController.updateVoucher);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.checkRole(['marketing_staff', 'admin']), voucherController.deleteVoucher);
router.post('/apply', authMiddleware.verifyToken, authMiddleware.isCustomer, voucherController.applyVoucher);
router.get('/validate', voucherController.validateVoucher);
router.get('/usage-stats',voucherController.getVoucherUsageStats);
router.get('/usage-detail', voucherController.getVoucherUsageDetail);

module.exports = router;