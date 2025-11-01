const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [CartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Calculate totals
CartSchema.methods.calculateTotals = function() {
  const subtotal = this.items.reduce((total, item) => {
    // Nếu có discount_price thì dùng discount_price, không thì dùng price
    const effectivePrice = (item.product && item.product.discount_price != null)
      ? item.product.discount_price
      : item.price;
    return total + (effectivePrice * item.quantity);
  }, 0);

  // Freeship cho đơn hàng từ 500k trở lên
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  return {
    subtotal,
    shipping,
    total
  };
};

// Update cart timestamp
CartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Cart", CartSchema, "carts"); // 'carts' is the collection name in MongoDB
