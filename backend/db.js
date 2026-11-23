const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Configure public DNS resolution for cloud SRV lookups (prevents ISP/local DNS querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Ignored if custom dns servers cannot be set
}

// Models
const User = require('./models/User');
const Contractor = require('./models/Contractor');
const Material = require('./models/Material');
const Booking = require('./models/Booking');
const KycApplication = require('./models/KycApplication');
const Dispute = require('./models/Dispute');

const DB_FILE = path.join(__dirname, 'database.json');
const DEFAULT_MONGO_URI = 'mongodb+srv://ankitvis787966_db_user:setu7879@cluster0.wrasvoe.mongodb.net/setu?retryWrites=true&w=majority';

let isMongoConnected = false;
let mongoConnectionError = null;
let cachedPromise = null;

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return true;
  }

  if (cachedPromise) {
    try {
      await cachedPromise;
      isMongoConnected = mongoose.connection.readyState === 1;
      return isMongoConnected;
    } catch (e) {
      cachedPromise = null;
    }
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    cachedPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    await cachedPromise;
    isMongoConnected = mongoose.connection.readyState === 1;
    mongoConnectionError = null;
    console.log('✅ MongoDB Connected Successfully to:', mongoose.connection.host);

    // Seed data if empty
    await seedMongoDatabase();
    return true;
  } catch (err) {
    cachedPromise = null;
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
  const isConnected = mongoose.connection && mongoose.connection.readyState === 1;
  return {
    isMongoConnected: isConnected,
    mongoConnectionError,
    activeEngine: isConnected ? 'MongoDB (Cloud/Atlas)' : 'Persistent Local DB (database.json)',
    host: isConnected ? mongoose.connection.host : 'localhost (file)',
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
