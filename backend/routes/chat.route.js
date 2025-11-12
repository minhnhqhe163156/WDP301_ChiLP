const express = require("express");
const router = express.Router();
const { messageUpload } = require("../middlewares/upload.middleware");
const { uploadErrorHandler } = require("../middlewares/errorHandle.middleware");
const  authMiddleware  = require("../middlewares/authMiddleware.js");

// Import controllers
const sellerChatController = require("../controllers/seller.chat.controller");
const buyerChatController = require("../controllers/customer.chat.controller");
const sharedChatController = require("../controllers/shared.chat.controller");

// Apply authentication middleware to all routes
router.use(authMiddleware.verifyToken);

router.post(
  "/:sellerId/:productId",
  messageUpload.array("images", 5),
  uploadErrorHandler,
  buyerChatController.sendChatWithProduct
);

// Buyer routes
router.post(
  "/chat-to-seller",
  messageUpload.array("images", 5),
  uploadErrorHandler,
  buyerChatController.sendChatToSeller
);
router.get(
  "/messages/coversation/customer",
  buyerChatController.getConversationDetailCustomer
);
router.get(
  "/conversations/customer",
  buyerChatController.getCustomerConversations
);
router.get(
  "/conversations/:conversationId/messages",
  buyerChatController.getConversationMessagesCustomer
);
// Seller routes
router.get(
  "/conversations/seller",
  sellerChatController.getConversationsSeller
);
router.get(
  "/messages/conversation/:conversationId",
  sharedChatController.getConversationHistory
);
router.patch(
  "/messages/conversation/:conversationId/read",
  sharedChatController.markMessagesAsRead
);
router.post(
  "/chat-to-customer",
  messageUpload.array("images", 5),
  uploadErrorHandler,
  sellerChatController.sendChatCustomer
);
module.exports = router;
