const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
 
  },
  content: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: String,
  tags: [String],
  featured_image: String,
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
});

module.exports = mongoose.model("Blog", BlogSchema, "blogs"); // 'blogs' is the collection name in MongoDB
