const Statistics = require('../models/Statistics');
const Order = require('../models/Order');

exports.generateStatistics = async (req, res) => {
  try {
    const date = new Date(req.body.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'delivered',
    });

    const total_revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const total_orders = orders.length;
    const new_orders = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const statistics = new Statistics({
      date: startOfDay,
      total_revenue,
      total_orders,
      new_orders,
    });
    await statistics.save();
    res.status(201).json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const statistics = await Statistics.find();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};