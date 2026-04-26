const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    // 1. Check if item already exists
    const existing = await Wishlist.findOne({ user: req.user.id, product: productId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    // 2. Create new wishlist entry
    const wishlistItem = await Wishlist.create({
      user: req.user.id,
      product: productId
    });

    res.status(201).json({
      success: true,
      data: wishlistItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  try {
    const item = await Wishlist.findOneAndDelete({
      user: req.user.id,
      product: productId
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user.id })
      .populate('product')
      .sort('-createdAt');

    // Extract products from the wishlist items
    const products = items.map(item => item.product).filter(p => p !== null);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist
};
