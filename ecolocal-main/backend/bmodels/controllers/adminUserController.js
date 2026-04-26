const User = require('../models/User');
const Order = require('../models/Order');
const Booking = require('../models/Booking');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users
// Returns all registered users with totalOrders and totalBookings counts.
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate order + booking counts in parallel per user
    const enriched = await Promise.all(
      users.map(async (u) => {
        const [totalOrders, totalBookings] = await Promise.all([
          Order.countDocuments({ user: u._id }),
          Booking.countDocuments({ user: u._id }),
        ]);
        return { ...u, totalOrders, totalBookings };
      })
    );

    res.json({ success: true, count: enriched.length, users: enriched });
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/users/:id/role
// Body: { role: "user" | "admin" | "provider" }
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['user', 'admin', 'provider'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed: ${allowedRoles.join(', ')}`,
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent demoting yourself
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own admin role.',
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to "${role}"`,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('changeUserRole error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users/:id/orders
// Returns all orders for a given user.
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = orders.map((o) => ({
      _id: o._id,
      orderItems: o.orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      status: o.status,
      totalPrice: o.totalPrice,
      paymentMethod: o.paymentMethod,
      isPaid: o.isPaid,
      isDelivered: o.isDelivered,
      orderedAt: o.createdAt,
      deliveredAt: o.deliveredAt || null,
    }));

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email },
      totalOrders: formatted.length,
      orders: formatted,
    });
  } catch (err) {
    console.error('getUserOrders error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users/:id/bookings
// Returns all service bookings for a given user.
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const getUserBookings = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bookings = await Booking.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = bookings.map((b) => ({
      _id: b._id,
      serviceName: b.serviceName,
      provider: b.providerName,
      bookingDate: b.bookingDate,
      completionDate: b.completionDate || null,
      status: b.status,
      totalPrice: b.totalPrice,
    }));

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email },
      totalBookings: formatted.length,
      bookings: formatted,
    });
  } catch (err) {
    console.error('getUserBookings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllUsers, changeUserRole, getUserOrders, getUserBookings };
