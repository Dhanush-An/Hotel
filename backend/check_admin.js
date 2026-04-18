const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Staff = require('./models/Staff');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await Staff.findOne({ phone: '6369406416' });
    if (admin) {
      console.log('Admin found:');
      console.log('Phone:', admin.phone);
      console.log('Password Hash:', admin.password);
      console.log('Hashed length:', admin.password.length);
    } else {
      console.log('Admin not found');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAdmin();
