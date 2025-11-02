const Feedback = require('../models/Feedback');
const FeedbackReply = require('../models/FeedbackReply');

exports.createFeedback = async (req, res) => {
  const { product_id, content } = req.body;
  try {
    const feedback = new Feedback({
      product_id,
      user_id: req.user._id,
      content,
    });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFeedbackByProduct = async (req, res) => {
  try {
    const feedback = await Feedback.find({ product_id: req.params.productId }).populate('user_id');
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.replyToFeedback = async (req, res) => {
  const { feedback_id, content } = req.body;
  try {
    const reply = new FeedbackReply({
      feedback_id,
      user_id: req.user._id,
      content,
    });
    await reply.save();
    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};