// server/controllers/orderController.js
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const asyncHandler = require('express-async-handler');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const userId = req.user._id;

  // 1) Get user's cart
  const cart = await Cart.findOne({ user: userId });

  if (!cart || !cart.items || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  // 2) Calculate total from cart items
  const totalPrice = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // 3) Create order
  const order = await Order.create({
    user: userId,
    orderItems: cart.items,
    shippingAddress,
    paymentMethod,
    totalPrice
  });

  // 4) Optional: clear cart
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json(order);
});

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    'orderItems.product'
  );
  res.json(orders);
});

// @desc    Update order status (admin/tracking)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.status = req.body.status;
    order.trackingNumber = req.body.trackingNumber || order.trackingNumber;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});
// @desc    Get all orders (admin)
// @route   GET /api/orders/all
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email')
    .populate('orderItems.product');
  res.json(orders);
});

module.exports = { createOrder, getMyOrders, updateOrderStatus, getAllOrders };


