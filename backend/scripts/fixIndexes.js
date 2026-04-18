const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collection = mongoose.connection.collection('users');
        
        console.log('Current indexes:');
        const indexes = await collection.indexes();
        console.log(indexes);

        // Check for phone_1 or mobile_1 unique indexes
        for (const index of indexes) {
            if (index.name === 'phone_1' || index.name === 'mobile_1') {
                console.log(`Dropping index: ${index.name}`);
                await collection.dropIndex(index.name);
                console.log(`Index ${index.name} dropped.`);
            }
        }
        
        console.log('Index cleanup complete.');
    } catch (err) {
        console.error('Error during index cleanup:', err.message);
    } finally {
        mongoose.disconnect();
    }
};

fixIndexes();
