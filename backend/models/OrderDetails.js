const mongoose = require('mongoose');

const OrderDetailSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total_price: Number
});

module.exports = mongoose.model('OrderDetail', OrderDetailSchema, 'order_details'); // 'order_details' is the collection name in MongoDB