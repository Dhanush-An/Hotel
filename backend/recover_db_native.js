
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI; 

async function recoverData() {
  const client = new MongoClient(MONGODB_URI);
  try {
     await client.connect();
     console.log("Connected to MongoDB Native. Starting scan...");
     const db = client.db();
     const bookings = db.collection('bookings');
     const rooms = db.collection('rooms');

     const allCount = await bookings.countDocuments();
     console.log("Total Bookings found in database: " + allCount);

     const suspects = await bookings.find({ 
       $or: [
         { room: "N/A" }, 
         { room: "undefined" }, 
         { room: "null" },
         { room: "" },
         { room: /undefined/i },
         { room: /null/i }
       ]
     }).toArray();

     console.log(`Found ${suspects.length} suspicious bookings.`);

     if (suspects.length === 0) return;

     const activeRooms = await rooms.find({ guests: { $ne: null } }).toArray();
     console.log(`Checking ${activeRooms.length} occupied rooms for matches...`);

     let recovered = 0;
     for (const b of suspects) {
        const guestName = b.guest || "";
        const match = activeRooms.find(r => {
           const g = r.guests;
           const primaryGuest = g.guestsList?.[0]?.name || g.name || "";
           return (primaryGuest.toLowerCase() === guestName.toLowerCase() && g.checkInDate === b.checkin);
        });

        if (match) {
           console.log(`Recovered booking ${b.id}: Guest ${guestName} assigned to Room ${match.roomNumber}`);
           await bookings.updateOne({ _id: b._id }, { $set: { room: match.roomNumber } });
           recovered++;
        }
     }
     console.log(`Successfully recovered ${recovered} bookings.`);

  } finally {
     await client.close();
  }
}

recoverData().catch(console.error);
