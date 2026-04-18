const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const Staff = require('./backend/models/Staff');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminPhone = '6369406416';
    const user = await Staff.findOne({ phone: adminPhone });
    
    if (!user) {
        console.log('User not found');
        process.exit(0);
    }
    
    console.log('Stored password:', user.password);
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('Comparison with "admin123":', isMatch);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

test();
