const mongoose = require("mongoose");

const ShippingSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  address: String,
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered"],
    default: "pending",
  },
  tracking_number: String,
  carrier: String,
  estimated_delivery: Date,
});

module.exports = mongoose.model("Shipping", ShippingSchema);
