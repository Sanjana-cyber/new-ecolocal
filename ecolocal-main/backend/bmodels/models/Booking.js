const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    // snapshot of service name at booking time
    serviceName: {
      type: String,
      required: true,
    },
    // snapshot of provider name at booking time
    providerName: {
      type: String,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    completionDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      trim: true,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
