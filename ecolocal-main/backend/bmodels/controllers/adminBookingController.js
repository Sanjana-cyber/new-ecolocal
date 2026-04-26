const Booking = require('../models/Booking');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/bookings
// Query: status, sort, page, limit, search
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const { status, sort = 'latest', page = 1, limit = 15, search = '' } = req.query;

    /* ── Build filter ── */
    const filter = {};
    if (status) filter.status = status.toUpperCase();

    /* ── Sort map ── */
    const sortMap = {
      latest:  { createdAt: -1 },
      oldest:  { createdAt:  1 },
      soonest: { bookingDate: 1 },
    };
    const sortOpt = sortMap[sort] || sortMap.latest;

    /* ── Pagination ── */
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip     = (pageNum - 1) * limitNum;

    /* ── Fetch with user populate ── */
    let bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('service', 'name')
      .sort(sortOpt)
      .skip(skip)
      .limit(limitNum)
      .lean();

    /* ── Client-side search on name / email / booking id / service name ── */
    if (search.trim()) {
      const q = search.toLowerCase();
      bookings = bookings.filter((b) => {
        const idMatch      = b._id.toString().toLowerCase().includes(q);
        const userMatch    = b.user?.name?.toLowerCase().includes(q);
        const emailMatch   = b.user?.email?.toLowerCase().includes(q);
        const serviceMatch = b.serviceName?.toLowerCase().includes(q);
        const provMatch    = b.providerName?.toLowerCase().includes(q);
        return idMatch || userMatch || emailMatch || serviceMatch || provMatch;
      });
    }

    const total = await Booking.countDocuments(filter);
    const pages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages,
      bookings,
    });
  } catch (err) {
    console.error('getAllBookings (admin) error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/bookings/:id
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('service', 'name category')
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    console.error('getBookingById (admin) error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/bookings/:id/status
// Body: { status: "CONFIRMED" }
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    if (!allowed.includes(status?.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(', ')}`,
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status.toUpperCase();

    // Auto-set completion date
    if (booking.status === 'COMPLETED' && !booking.completionDate) {
      booking.completionDate = new Date();
    }

    await booking.save();
    const updated = await Booking.findById(booking._id).populate('user', 'name email').lean();

    res.json({ success: true, message: `Booking status updated to "${booking.status}"`, booking: updated });
  } catch (err) {
    console.error('updateBookingStatus (admin) error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/bookings/:id
// Admin only.
// ─────────────────────────────────────────────────────────────────────────────
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('deleteBooking (admin) error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllBookings, getBookingById, updateBookingStatus, deleteBooking };
