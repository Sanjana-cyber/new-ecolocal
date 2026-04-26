const express = require('express');
const router  = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');

/* ── Controllers ── */
const {
  getAllUsers,
  changeUserRole,
  getUserOrders,
  getUserBookings,
} = require('../controllers/adminUserController');

const { getAdminStats } = require('../controllers/adminStatsController');

const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/adminOrderController');

const {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/adminBookingController');

/* ─────────────── DASHBOARD STATS ─────────────── */
// GET  /api/admin/stats
router.get('/stats', protect, isAdmin, getAdminStats);

/* ─────────────── USER MANAGEMENT ─────────────── */
// GET  /api/admin/users
router.get('/users', protect, isAdmin, getAllUsers);
// PUT  /api/admin/users/:id/role
router.put('/users/:id/role', protect, isAdmin, changeUserRole);
// GET  /api/admin/users/:id/orders
router.get('/users/:id/orders', protect, isAdmin, getUserOrders);
// GET  /api/admin/users/:id/bookings
router.get('/users/:id/bookings', protect, isAdmin, getUserBookings);

/* ─────────────── ORDERS ─────────────── */
// GET  /api/admin/orders           (+ ?status ?sort ?page ?limit ?search)
router.get('/orders', protect, isAdmin, getAllOrders);
// GET  /api/admin/orders/:id
router.get('/orders/:id', protect, isAdmin, getOrderById);
// PUT  /api/admin/orders/:id/status
router.put('/orders/:id/status', protect, isAdmin, updateOrderStatus);
// DELETE /api/admin/orders/:id
router.delete('/orders/:id', protect, isAdmin, deleteOrder);

/* ─────────────── BOOKINGS ─────────────── */
// GET  /api/admin/bookings         (+ ?status ?sort ?page ?limit ?search)
router.get('/bookings', protect, isAdmin, getAllBookings);
// GET  /api/admin/bookings/:id
router.get('/bookings/:id', protect, isAdmin, getBookingById);
// PUT  /api/admin/bookings/:id/status
router.put('/bookings/:id/status', protect, isAdmin, updateBookingStatus);
// DELETE /api/admin/bookings/:id
router.delete('/bookings/:id', protect, isAdmin, deleteBooking);

module.exports = router;
