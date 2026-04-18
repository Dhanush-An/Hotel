const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  dept: { type: String },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  method: { type: String, default: 'Cash' },
  status: { type: String, default: 'Paid' },
  approvedBy: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
