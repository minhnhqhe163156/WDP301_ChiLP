const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    products: [
      {
        // Danh sách các sản phẩm đã thảo luận trong cuộc trò chuyện này
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
// Tạo index cho truy vấn hiệu quả
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ participants: 1, isActive: 1, updatedAt: -1 });

module.exports = mongoose.model(
  "Conversation",
  ConversationSchema,
  "conversations"
); // 'conversations' is the collection name in MongoDB
