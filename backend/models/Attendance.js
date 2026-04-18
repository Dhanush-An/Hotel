const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staffId: { type: String, required: true },
  staffName: { type: String, required: true },
  dept: { type: String, required: true },
  date: { type: String, required: true },
  checkin: { type: String },
  checkout: { type: String },
  status: { type: String, default: 'Present' },
  location: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
