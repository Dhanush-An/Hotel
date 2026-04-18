const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    await connectDB();

    try {
        const email = 'admin@hotel.com';
        const password = 'admin123';
        const name = 'Admin User';
        const mobile = '0000000000';
        const role = 'admin';

        let user = await User.findOne({ email });

        if (user) {
            console.log('Admin user already exists. Updating credentials...');
            user.password = password;
            user.name = name;
            user.role = role;
            await user.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log('Creating new Admin user...');
            user = new User({
                name,
                email,
                mobile,
                password,
                role
            });
            await user.save();
            console.log('Admin user created successfully.');
        }
    } catch (err) {
        console.error('Error seeding admin:', err.message);
    } finally {
        mongoose.disconnect();
    }
};

seedAdmin();
