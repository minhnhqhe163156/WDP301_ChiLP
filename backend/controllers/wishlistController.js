const Wishlist = require('../models/Wishlist');
const User = require('../models/User');

exports.addToWishlist = async (req, res) => {
  const { product_id } = req.body;
  try {
    const wishlistItem = new Wishlist({
      user_id: req.user._id,
      product_id,
    });
    await wishlistItem.save();
    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user_id: req.user._id }).populate('product_id');
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.deleteOne({ user_id: req.user._id, product_id: req.params.productId });
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Lấy wishlist theo email
exports.getWishlistByUserEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const users = await User.find({ email });
    const userIds = users.map(u => u._id);
    const wishlist = await Wishlist.find({ user_id: { $in: userIds } }).populate('product_id');
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};