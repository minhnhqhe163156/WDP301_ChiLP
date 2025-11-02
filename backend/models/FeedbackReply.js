const mongoose = require("mongoose");

const FeedbackReplySchema = new mongoose.Schema({
  feedback_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Feedback",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: String,
});

module.exports = mongoose.model("FeedbackReply", FeedbackReplySchema);
