
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI; 

async function listCollections() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  
  await mongoose.disconnect();
}

listCollections();
