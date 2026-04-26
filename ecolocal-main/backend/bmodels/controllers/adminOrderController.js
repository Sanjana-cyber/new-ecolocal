const Order = require('../models/Order');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/orders
// Query: status, sort, page, limit, search
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { status, sort = 'latest', page = 1, limit = 15, search = '' } = req.query;

    /* ── Build filter ── */
    const filter = {};
    if (status) filter.status = status.toUpperCase();

    /* ── Sort map ── */
    const sortMap = {
      latest:  { createdAt: -1 },
      oldest:  { createdAt:  1 },
      highest: { totalPrice: -1 },
      lowest:  { totalPrice:  1 },
    };
    const sortOpt = sortMap[sort] || sortMap.latest;

    /* ── Pagination ── */
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    /* ── Fetch with user populate ── */
    let orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort(sortOpt)
      .skip(skip)
      .limit(limitNum)
      .lean();

    /* ── Client-side search on name / email / orderId / product name ── */
    if (search.trim()) {
      const q = search.toLowerCase();
      orders = orders.filter((o) => {
        const idMatch    = o._id.toString().toLowerCase().includes(q);
        const nameMatch  = o.user?.name?.toLowerCase().includes(q);
        const emailMatch = o.user?.email?.toLowerCase().includes(q);
        const itemMatch  = o.orderItems?.some((i) => i.name?.toLowerCase().includes(q));
        return idMatch || nameMatch || emailMatch || itemMatch;
      });
    }

    const total = await Order.countDocuments(filter);
    const pages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages,
      orders,
    });
  } catch (err) {
    console.error('getAllOrders (admin) error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/orders/:id
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    console.error('getOrderById (admin) error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/orders/:id/status
// Body: { status: "CONFIRMED" }
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!allowed.includes(status?.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status.toUpperCase();

    // Auto-set delivery flags
    if (order.status === 'DELIVERED') {
      order.isDelivered = true;
      order.deliveredAt = order.deliveredAt || new Date();
    }

    await order.save();
    const updated = await Order.findById(order._id).populate('user', 'name email').lean();

    res.json({ success: true, message: `Order status updated to "${order.status}"`, order: updated });
  } catch (err) {
    console.error('updateOrderStatus (admin) error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/orders/:id
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error('deleteOrder (admin) error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllOrders, getOrderById, updateOrderStatus, deleteOrder };
