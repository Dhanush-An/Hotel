const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const updatePrices = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for price update...");

        const rooms = await Room.find({});
        console.log(`Updating ${rooms.length} rooms...`);

        for (const room of rooms) {
            const isAC = room.facilities?.ac === true || String(room.type || '').toUpperCase().includes('AC');
            
            if (isAC && !String(room.type || '').toUpperCase().includes('NON-AC')) {
                // AC Room Pricing: 1500, +400, +400, +300 (Total 2600)
                room.price = 1500;
                room.price2 = 400;
                room.price3 = 400;
                room.price4 = 300;
                console.log(`Room ${room.roomNumber}: Set to AC pricing (1500/400/400/300)`);
            } else {
                // Non-AC Room Pricing: 1000, +500, +400, +400 (Total 2300)
                room.price = 1000;
                room.price2 = 500;
                room.price3 = 400;
                room.price4 = 400;
                console.log(`Room ${room.roomNumber}: Set to Non-AC pricing (1000/500/400/400)`);
            }
            await room.save();
        }

        console.log("Room prices successfully updated according to the new policy!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

updatePrices();
