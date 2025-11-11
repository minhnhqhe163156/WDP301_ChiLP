const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema({
  voucher_code: {
    type: String,
    required: true,
    unique: true,
  },
  discount_value: Number,
  discount_type: { type: String, enum: ['amount', 'percent'], default: 'amount' },
  status: {
    type: String,
    enum: ["active", "expired", "used"],
    default: "active",
  },
  start_date: Date,
  end_date: Date,
  minimum_purchase: Number,
  maximum_discount: Number,
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  usage_limit: Number,
  used_count: {
    type: Number,
    default: 0,
  },
});

VoucherSchema.pre('save', function(next) {
  if (this.end_date && new Date() > this.end_date) {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model("Voucher", VoucherSchema);
