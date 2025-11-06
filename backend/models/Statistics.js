const mongoose = require("mongoose");

const StatisticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  total_revenue: Number,
  total_orders: Number,
  new_orders: Number,
});

module.exports = mongoose.model("Statistics", StatisticsSchema);
