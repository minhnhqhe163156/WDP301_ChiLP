const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.chat.controller");
const sellerController = require("../controllers/seller.chat.controller");
const authMiddleware = require("../middlewares/authMiddleware");

// Customer lấy danh sách seller để chat
router.get("/sellers-for-chat", authMiddleware.verifyToken, authMiddleware.isCustomer, customerController.getSellersForChat);

// Seller lấy danh sách customer để chat
router.get("/customers-for-chat", authMiddleware.verifyToken, authMiddleware.isSeller, sellerController.getCustomersForChat);

// router.get("/profile", authMiddleware.verifyToken, authMiddleware.isCustomer, customerController.getProfile);
// router.put("/profile", authMiddleware.verifyToken, authMiddleware.isCustomer, customerController.updateProfile);

module.exports = router;
