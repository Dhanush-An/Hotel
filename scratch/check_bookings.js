
const mongoose = require('mongoose');
const Booking = require('../backend/models/Booking');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const check = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-mgmt';
        console.log('Connecting to:', uri.split('@')[1] || uri); // Hide credentials
        await mongoose.connect(uri);
        const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(10);
        console.log('Latest 10 Bookings:');
        bookings.forEach(b => {
            console.log(`ID: ${b.id}, Guest: ${b.guest}, Source: ${b.source}, Status: ${b.status}, CreatedAt: ${b.createdAt}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
