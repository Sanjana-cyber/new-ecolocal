const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');

const {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');



// User: place order from cart
router.post('/', protect, createOrder);

// User: get own orders
router.get('/', protect, getMyOrders);

// Admin: update order status
router.get('/all', protect, isAdmin, getAllOrders);
router.put('/:id/status', protect, isAdmin, updateOrderStatus);

module.exports = router;
