const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to:', mongoose.connection.name);
        const users = await User.find({}, 'name email role');
        console.log('Users in database:', users);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        mongoose.disconnect();
    }
};

checkUsers();
