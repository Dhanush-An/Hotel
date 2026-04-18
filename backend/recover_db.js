
const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const Room = require('./models/Room');

const MONGODB_URI = process.env.MONGO_URI; 

async function recoverData() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");

  const allCount = await Booking.countDocuments();
  console.log(`Total Bookings in DB: ${allCount}`);

  const suspectBookings = await Booking.find({ 
    $or: [
      { room: "N/A" }, 
      { room: "undefined" }, 
      { room: "null" },
      { room: "" },
      { room: { $regex: /undefined/i } },
      { room: { $regex: /null/i } }
    ]
  });
  console.log(`Found ${suspectBookings.length} suspicious bookings.`);

  if (suspectBookings.length === 0) {
    await mongoose.disconnect();
    return;
  }

  const rooms = await Room.find({ guests: { $ne: null } });
  console.log(`Checking ${rooms.length} occupied rooms for matching guests...`);

  let recovered = 0;
  for (const b of suspectBookings) {
    const guestName = b.guest || "";
    // Search rooms for this guest
    const match = rooms.find(r => {
       const g = r.guests;
       const primaryGuest = g.guestsList?.[0]?.name || g.name || "";
       return primaryGuest.toLowerCase() === guestName.toLowerCase() && g.checkInDate === b.checkin;
    });

    if (match) {
      console.log(`Recovered booking ${b.id}: Guest ${guestName} matches Room ${match.roomNumber}`);
      await Booking.findByIdAndUpdate(b._id, { room: match.roomNumber });
      recovered++;
    }
  }

  console.log(`Successfully recovered ${recovered} bookings.`);
  await mongoose.disconnect();
}

recoverData();
