const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const clearDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to: ${mongoose.connection.host} / DB: ${mongoose.connection.name}`);
        
        // 1. Drop the users collection
        try {
            await mongoose.connection.collection('users').drop();
            console.log('Users collection dropped.');
        } catch (e) {
            console.log('Users collection not found or already dropped.');
        }

        // 2. Clear Staff collection as well since identities are linked
        try {
            await mongoose.connection.collection('staffs').drop(); 
            console.log('Staff collection dropped.');
        } catch (e) {
            console.log('Staff collection not found or already dropped.');
        }

        console.log('Database cleared of all login credentials.');
        
        // 3. Re-seed the main Admin
        const adminEmail = 'admin@hotel.com';
        const adminPassword = 'admin123';
        const adminName = 'System Admin';
        const adminRole = 'admin';

        const admin = new User({
            name: adminName,
            email: adminEmail,
            mobile: '0000000000',
            password: adminPassword,
            role: adminRole
        });

        await admin.save();
        console.log(`Admin account [${adminEmail} / ${adminPassword}] has been recreated.`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        mongoose.disconnect();
    }
};

clearDatabase();
