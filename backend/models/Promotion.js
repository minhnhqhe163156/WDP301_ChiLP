const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  start_date: Date,
  end_date: Date,
  discount_rate: Number,
  target_audience: String,
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Promotion", PromotionSchema);
