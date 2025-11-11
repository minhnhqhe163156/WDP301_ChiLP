const Shipping = require('../models/Shipping');

exports.createShipping = async (req, res) => {
  const { order_id, address, carrier, estimated_delivery } = req.body;
  try {
    const shipping = new Shipping({
      order_id,
      address,
      carrier,
      estimated_delivery,
    });
    await shipping.save();
    res.status(201).json(shipping);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getShipping = async (req, res) => {
  try {
    const shipping = await Shipping.find({ order_id: req.params.orderId });
    res.json(shipping);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateShippingStatus = async (req, res) => {
  const { status, tracking_number } = req.body;
  try {
    const shipping = await Shipping.findOne({ order_id: req.params.orderId });
    if (!shipping) return res.status(404).json({ message: 'Shipping not found' });
    shipping.status = status;
    shipping.tracking_number = tracking_number || shipping.tracking_number;
    await shipping.save();
    res.json(shipping);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};