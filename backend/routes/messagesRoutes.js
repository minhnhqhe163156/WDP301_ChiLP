const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const messagesController = require("../controllers/messagesController.js");

// Get all messages in a conversation
router.get(
  "/user",
  authMiddleware.verifyToken,
  messagesController.GetUserForSidebar
);
router.get("/:id", authMiddleware.verifyToken, messagesController.GetMessages);
router.get(
  "send/:id",
  authMiddleware.verifyToken,
  messagesController.SendMessage
);
module.exports = router;
