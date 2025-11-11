const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["marketing_staff", "admin"]),
  promotionController.createPromotion
);
router.get("/", promotionController.getPromotions);

module.exports = router;
