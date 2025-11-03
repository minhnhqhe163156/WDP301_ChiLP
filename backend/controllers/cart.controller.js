const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price discount_price images imageurl brand category');

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    const totals = cart.calculateTotals();

    res.json({
      items: cart.items,
      ...totals
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size } = req.body;
    console.log('[addToCart] productId:', productId, 'size:', size, 'quantity:', quantity);

    // Validate product exists
    const product = await Product.findById(productId);
    console.log('[addToCart] product:', product);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate size
    if (!size) {
      return res.status(400).json({ message: "Size is required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    console.log('[addToCart] cart:', cart);
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists with same product and size
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === size
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        size,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price discount_price images imageurl brand category');

    const totals = cart.calculateTotals();

    res.json({
      items: cart.items,
      ...totals
    });
  } catch (error) {
    console.error('[addToCart] ERROR:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update item quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name price discount_price images imageurl brand category');

    const totals = cart.calculateTotals();

    res.json({
      items: cart.items,
      ...totals
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate('items.product', 'name price discount_price images imageurl brand category');

    const totals = cart.calculateTotals();

    res.json({
      items: cart.items,
      ...totals
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({
      items: [],
      subtotal: 0,
      shipping: 0,
      total: 0
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get cart count
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};