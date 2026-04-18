const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  name: { type: String },
  floor: { type: String },
  maxOccupancy: { type: Number, default: 2 },
  roomSize: { type: String },
  numberOfBeds: { type: Number, default: 1 },
  type: { type: String, required: true },
  bedType: { type: String },
  price: { type: Number, required: true },
  price2: { type: Number, default: 400 },
  price3: { type: Number, default: 400 },
  price4: { type: Number, default: 300 },

  weekendPrice: { type: Number, default: 0 },
  discountPrice: { type: Number, default: 0 },
  extraBedCharge: { type: Number, default: 0 },
  facilities: {
    ac: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    tv: { type: Boolean, default: false },
    bathroom: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    miniFridge: { type: Boolean, default: false },
    roomService: { type: Boolean, default: false },
    breakfastIncluded: { type: Boolean, default: false }
  },
  status: { type: String, default: 'Available' },
  housekeeping: { type: String, default: 'Clean' },
  issue: { type: String, default: '' },
  guests: { type: Object, default: null }
}, { timestamps: true });

roomSchema.index({ status: 1 });

module.exports = mongoose.model('Room', roomSchema);

