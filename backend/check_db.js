
const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const Room = require('./models/Room');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-test'; 

async function checkData() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");

  const bookings = await Booking.find({ room: { $in: ["N/A", "undefined", "ROOM undefined", "Room N/A", ""] } });
  console.log(`Found ${bookings.length} suspicious bookings:`);
  bookings.slice(0, 10).forEach(b => {
    console.log(`ID: ${b.id}, Guest: ${b.guest}, Room field: "${b.room}"`);
  });

  const rooms = await Room.find({});
  console.log(`Total Rooms in DB: ${rooms.length}`);
  rooms.forEach(r => {
    if (!r.roomNumber) console.log(`ALERT: Room without roomNumber! ID: ${r._id}`);
  });

  await mongoose.disconnect();
}

checkData();
