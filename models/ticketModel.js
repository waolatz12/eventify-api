const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    eventDate: { type: Date, required: true },
    purchasedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'cancelled', 'paid'],
      default: 'pending',
    },
    venue: { type: String, required: true },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Ticket', ticketSchema);
