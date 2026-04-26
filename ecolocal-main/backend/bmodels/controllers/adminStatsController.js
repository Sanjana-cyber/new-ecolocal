const User    = require('../models/User');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Order   = require('../models/Order');
const Booking = require('../models/Booking');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// Returns full analytics data for the admin dashboard.
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const getAdminStats = async (req, res) => {
  try {
    /* ── 1. Top-level counts (parallel) ── */
    const [totalUsers, totalProducts, totalServices, totalOrders, totalBookings] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Service.countDocuments(),
        Order.countDocuments(),
        Booking.countDocuments(),
      ]);

    /* ── 2. Total revenue from all orders ── */
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    /* ── 3. Orders trend – last 7 days ── */
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const ordersTrendRaw = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%d %b', date: '$createdAt' },
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build full 7-day array (fill missing days with 0)
    const trend7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const found = ordersTrendRaw.find((r) => r._id === label);
      trend7.push({ date: label, orders: found?.orders || 0, revenue: found?.revenue || 0 });
    }

    const ordersTrend  = trend7.map(({ date, orders })  => ({ date, orders }));
    const revenueTrend = trend7.map(({ date, revenue }) => ({ date, revenue }));

    /* ── 4. Order status distribution ── */
    const orderStatusRaw = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const orderStatusData = orderStatusRaw.map((r) => ({
      name: r._id,
      value: r.count,
    }));

    /* ── 5. Booking status distribution ── */
    const bookingStatusRaw = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const bookingStatusData = bookingStatusRaw.map((r) => ({
      name: r._id.replace('_', ' '),
      value: r.count,
    }));

    /* ── 6. Category distribution (products + services combined) ── */
    const [prodCats, svcCats] = await Promise.all([
      Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Service.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    // Merge both into one map
    const catMap = {};
    [...prodCats, ...svcCats].forEach(({ _id, count }) => {
      if (_id) catMap[_id] = (catMap[_id] || 0) + count;
    });
    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    /* ── 7. Recent orders (last 5) ── */
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean();

    const formattedRecent = recentOrders.map((o) => ({
      _id: o._id,
      user: o.user?.name || 'Unknown',
      email: o.user?.email || '',
      total: o.totalPrice,
      status: o.status,
      date: o.createdAt,
    }));

    res.json({
      success: true,
      totalUsers,
      totalProducts,
      totalServices,
      totalOrders,
      totalBookings,
      totalRevenue,
      ordersTrend,
      revenueTrend,
      orderStatusData,
      bookingStatusData,
      categoryData,
      recentOrders: formattedRecent,
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAdminStats };
