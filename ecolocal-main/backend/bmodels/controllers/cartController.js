// server/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, name, price, image, color, size, variantKey } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart = await Cart.findOne({ user: userId });

  if (cart) {
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.variantKey === (variantKey || 'default')
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        name: name || product.name,
        price: price || product.price,
        quantity,
        image: image || product.image,
        color,
        size,
        variantKey: variantKey || 'default'
      });
    }

    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
  } else {
    cart = await Cart.create({
      user: userId,
      items: [
        {
          product: productId,
          name: name || product.name,
          price: price || product.price,
          quantity,
          image: image || product.image,
          color,
          size,
          variantKey: variantKey || 'default'
        }
      ],
      totalPrice: (price || product.price) * quantity
    });
  }

  res.status(200).json(cart);
});

// @desc    Get cart items
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product'
  );

  res.json(cart || { items: [], totalPrice: 0 });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, variantKey, quantity } = req.body;
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId && item.variantKey === (variantKey || 'default')
  );

  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Product variant not in cart' });
  }

  cart.items[itemIndex].quantity = quantity;

  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  );

  await cart.save();
  res.json(cart);
});

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
// @query   variantKey
const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantKey } = req.query;
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  cart.items = cart.items.filter(
    item => !(item.product.toString() === productId && item.variantKey === (variantKey || 'default'))
  );

  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  );

  await cart.save();
  res.json(cart);
});

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem
};
