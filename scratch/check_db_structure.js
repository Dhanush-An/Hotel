const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const check = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        // Count entries in Bookings (case sensitive check)
        const count = await mongoose.connection.db.collection('bookings').countDocuments();
        console.log('Bookings count (lowercase):', count);
        
        const countCap = await mongoose.connection.db.collection('Bookings').countDocuments();
        console.log('Bookings count (Capital):', countCap);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
