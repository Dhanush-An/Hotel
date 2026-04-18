const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const clearBothDbs = async () => {
    const uris = [
        process.env.MONGO_URI,
        process.env.MONGO_URI.replace(/(\/hms\?)/, '/hotel_db?')
    ];

    for (const uri of uris) {
        try {
            console.log(`Connecting to: ${uri}...`);
            await mongoose.connect(uri);
            const dbName = mongoose.connection.name;
            console.log(`DB Name: ${dbName}`);

            // Drop users collection
            try { await mongoose.connection.collection('users').drop(); console.log(`Dropped users in ${dbName}`); } catch(e) { console.log(`Users in ${dbName} not found.`); }
            
            // Drop staff collection
            try { await mongoose.connection.collection('staffs').drop(); console.log(`Dropped staffs in ${dbName}`); } catch(e) { console.log(`Staffs in ${dbName} not found.`); }

            // Create admin user
            const admin = new User({
                name: 'System Admin',
                email: 'admin@hotel.com',
                mobile: '0000000000',
                password: 'admin123',
                role: 'admin'
            });
            await admin.save();
            console.log(`Admin account [admin@hotel.com / admin123] created in ${dbName}.`);

            await mongoose.disconnect();
        } catch (err) {
            console.error(`Error for ${uri}:`, err.message);
        }
    }
    console.log('Final cleanup complete.');
};

clearBothDbs();
