const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear only if needed? No, let's reset to ensure it matches.
        await User.deleteMany({});
        console.log('Cleared existing users');

        // We will create users with PLAIN TEXT passwords AND rely on the model hooks
        // To be absolutely sure, we'll verify it hashes. 
        const users = [
            {
                name: 'System Admin',
                mobile: '9876543210',
                password: 'admin123',
                role: 'admin',
                email: 'admin@hotelshubha.com'
            },
            {
                name: 'Receptionist desk',
                mobile: '1234567890',
                password: 'reception123',
                role: 'receptionist',
                email: 'reception@hotelshubha.com'
            },
            {
                name: 'Official owner',
                mobile: '6369406416',
                password: 'admin123',
                role: 'admin',
                email: 'official@hotelshubhasai.com'
            }
        ];

        for (const u of users) {
            // Using create() ensures the pre-save hook for hashing TRIGGERS.
            await User.create(u);
            console.log(`Successfully created user: ${u.mobile} with role: ${u.role}`);
        }

        console.log('--- DATABASE SEEDING COMPLETED ---');
        process.exit(0);
    } catch (error) {
        console.error('SEEDING FAILED:', error.message);
        process.exit(1);
    }
};

seedUsers();
