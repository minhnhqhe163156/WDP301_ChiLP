const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  product_name: {
    type: String,
    required: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ["available", "out_of_stock", "discontinued"],
    default: "available",
  },
  averageRating: Number,
  price: {
    type: Number,
    required: true,
  },
  quantity: Number,
  size: [String],
  color: String,
  totalReviews: Number,
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageurl: [String],
  brand: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: Date,
  discount_price: Number,
  is_featured: {
    type: Boolean,
    default: false,
  },
  tags: [{ type: String }],
  specifications: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model("Product", ProductSchema, "products");
