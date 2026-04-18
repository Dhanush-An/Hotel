const Room = require('../models/Room');

const getRooms = async (req, res) => {
  try {
    // Exclude 'guests' by default to keep the list response small and fast
    // We only include minimal guest info needed for the dashboard/grid view
    const rooms = await Room.find({}, {
      'guests.name': 1,
      'guests.checkOutDate': 1,
      'guests.checkOutTime': 1,
      'guests.numPersons': 1,
      'guests.mobile': 1,
      // Include all other fields
      roomNumber: 1, name: 1, floor: 1, maxOccupancy: 1, roomSize: 1,
      numberOfBeds: 1, type: 1, bedType: 1, price: 1, price2: 1,
      price3: 1, price4: 1, weekendPrice: 1, discountPrice: 1,
      extraBedCharge: 1, facilities: 1, status: 1, housekeeping: 1,
      issue: 1, createdAt: 1, updatedAt: 1
    }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `Room number ${req.body.roomNumber} already exists.` });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
    res.json(room);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: `Room number ${req.body.roomNumber} already exists.` });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRoom, getRooms, createRoom, updateRoom, deleteRoom };

