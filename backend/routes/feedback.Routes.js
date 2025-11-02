const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const authMiddleware = require("../middlewares/authMiddleware");

// router.post(
//   "/",
//   authMiddleware.verifyToken,
//   authMiddleware.isCustomer,
//   feedbackController.createFeedback
// );
router.get("/product/:productId", feedbackController.getFeedbackByProduct);
router.post(
  "/reply",
  authMiddleware.verifyToken,
  authMiddleware.isSeller,
  feedbackController.replyToFeedback
);

module.exports = router;
