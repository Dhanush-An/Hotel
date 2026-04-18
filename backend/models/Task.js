const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  staffName: { type: String, required: true },
  dept: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  priority: { type: String, default: 'Medium' },
  deadline: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
