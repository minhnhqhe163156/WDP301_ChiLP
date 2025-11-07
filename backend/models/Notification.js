const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, enum: ["customer", "seller"], required: true },
  type: { type: String, required: true }, // "order", "promotion", "feedback", ...
  title: { type: String }, // optional, for notification title
  message: { type: String, required: true },
  link: { type: String }, // e.g., "/orders/1234"
  data: { type: Object }, // optional, for extra info
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("Notification", NotificationSchema, "notifications");
