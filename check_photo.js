
const mongoose = require('mongoose');
const Booking = require('./backend/models/Booking');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/hotel-management');
  const lastBooking = await Booking.findOne().sort({ createdAt: -1 });
  console.log('Last Booking ID:', lastBooking.id);
  console.log('GuestsList Photo existence:', lastBooking.guestsList.map(g => ({
    name: g.name,
    hasFront: !!g.frontImage,
    hasAddress: !!g.addressImage,
    hasPhoto: !!g.guestPhoto
  })));
  process.exit();
}

check();
