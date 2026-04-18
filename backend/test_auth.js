const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Point to the correct .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Since this script is in 'backend/', the model is one level up
const Staff = require('./models/Staff');

const test = async () => {
  try {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not defined. Check your .env file path.');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminPhone = '6369406416';
    const user = await Staff.findOne({ phone: adminPhone });
    
    if (!user) {
        console.log('User not found');
        process.exit(0);
    }
    
    console.log('User found:', user.name);
    console.log('Stored hash:', user.password);
    
    const plainPassword = 'admin123';
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    console.log(`Manual compare with "${plainPassword}":`, isMatch);
    
    const isMatchWithMethod = await user.matchPassword(plainPassword);
    console.log(`Method compare with "${plainPassword}":`, isMatchWithMethod);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

test();
