const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const check = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);

        const roomsCount = await mongoose.connection.db.collection('rooms').countDocuments();
        console.log('Rooms count:', roomsCount);

        const usersCount = await mongoose.connection.db.collection('users').countDocuments();
        console.log('Users count:', usersCount);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
