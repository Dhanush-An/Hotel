const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  bookingId: { type: String, required: true },
  guest: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'Paid' },
  transactionId: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
