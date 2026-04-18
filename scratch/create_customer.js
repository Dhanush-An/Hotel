const mongoose = require('mongoose');
const dotenv = require('dotenv');

// We need to load env from backend directory to get the mongo URI
dotenv.config({ path: require('path').resolve(__dirname, '../backend/.env') });

const User = require('../backend/models/User');

const DB_URI = process.env.MONGO_URI || "mongodb+srv://dhanushoffical003:y5e72i6z94Tf3T6G@cluster0.zox6b.mongodb.net/hotel_management?retryWrites=true&w=majority";

const createCustomer = async () => {
    try {
        await mongoose.connect(DB_URI);
        const email = 'guest@shubhasai.com';
        const password = 'Password@123';
        const name = 'Guest Profile';
        const mobile = '9876543210';
        
        let user = await User.findOne({ email });
        
        if (user) {
            await User.deleteOne({ email });
        }
        
        // Recreate to ensure the password is known
        user = await User.create({
            name: name,
            email: email,
            mobile: mobile,
            password: password,
            role: 'customer'
        });

        console.log("---- CREDENTIALS ----");
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("---------------------");

        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
};

createCustomer();
