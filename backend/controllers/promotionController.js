const Promotion = require('../models/Promotion');

exports.createPromotion = async (req, res) => {
  const { name, start_date, end_date, discount_rate, target_audience } = req.body;
  try {
    const promotion = new Promotion({
      name, start_date, end_date, discount_rate, target_audience,
      created_by: req.user._id,
    });
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().populate('created_by');
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};