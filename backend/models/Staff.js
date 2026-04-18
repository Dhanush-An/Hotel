const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, unique: true }, // Aligned with DB index to avoid null duplicate errors
  name: { type: String, required: true },
  photo: { type: String },
  dob: { type: String },
  gender: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  role: { type: String, required: true },
  dept: { type: String, required: true },
  shift: { type: String },
  joinedDate: { type: String },
  basic: { type: Number, default: 0 },
  net: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
