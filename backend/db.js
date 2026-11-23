const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const User = require('./models/User');
const Contractor = require('./models/Contractor');
const Material = require('./models/Material');
const Booking = require('./models/Booking');
const KycApplication = require('./models/KycApplication');
const Dispute = require('./models/Dispute');

const DB_FILE = path.join(__dirname, 'database.json');

let isMongoConnected = false;
let mongoConnectionError = null;

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('ℹ️  MONGODB_URI not provided. Running with persistent Local Database (database.json).');
    console.log('💡 To use Free MongoDB Atlas: Set MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/setu in .env');
    return false;
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    mongoConnectionError = null;
    console.log('✅ MongoDB Connected Successfully to:', mongoose.connection.host);

    // Seed data if empty
    await seedMongoDatabase();
    return true;
  } catch (err) {
    mongoConnectionError = err.message;
    isMongoConnected = false;
    console.error('⚠️ MongoDB Connection Failed:', err.message);
    console.log('ℹ️  Falling back to persistent Local Database (database.json).');
    return false;
  }
}

// Seed initial data from database.json into MongoDB if empty
async function seedMongoDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0 && fs.existsSync(DB_FILE)) {
      console.log('🌱 Seeding initial data from database.json into MongoDB...');
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

      if (localData.users && localData.users.length > 0) {
        await User.insertMany(localData.users);
      }
      if (localData.contractors && localData.contractors.length > 0) {
        await Contractor.insertMany(localData.contractors.map((c) => ({ ...c, customId: c.id })));
      }
      if (localData.materials && localData.materials.length > 0) {
        await Material.insertMany(localData.materials.map((m) => ({ ...m, customId: m.id })));
      }
      if (localData.bookings && localData.bookings.length > 0) {
        await Booking.insertMany(localData.bookings.map((b) => ({ ...b, customId: b.id })));
      }
      if (localData.kycApplications && localData.kycApplications.length > 0) {
        await KycApplication.insertMany(localData.kycApplications.map((k) => ({ ...k, customId: k.id })));
      }
      if (localData.disputes && localData.disputes.length > 0) {
        await Dispute.insertMany(localData.disputes.map((d) => ({ ...d, customId: d.id })));
      }
      console.log('✅ Initial Data Seeded into MongoDB successfully!');
    }
  } catch (e) {
    console.error('Seeding error (non-fatal):', e.message);
  }
}

function getDbStatus() {
  return {
    isMongoConnected,
    mongoConnectionError,
    activeEngine: isMongoConnected ? 'MongoDB (Cloud/Atlas)' : 'Persistent Local DB (database.json)',
    host: isMongoConnected ? mongoose.connection.host : 'localhost (file)',
    modelsLoaded: ['User', 'Contractor', 'Material', 'Booking', 'KycApplication', 'Dispute'],
  };
}

module.exports = {
  connectDB,
  getDbStatus,
  models: {
    User,
    Contractor,
    Material,
    Booking,
    KycApplication,
    Dispute,
  },
};
