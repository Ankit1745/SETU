const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Configure public DNS resolution for cloud SRV lookups only when explicitly requested
if (process.env.FORCE_PUBLIC_DNS === 'true') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignored if custom dns servers cannot be set
  }
}

// Models
const User = require('./models/User');
const Contractor = require('./models/Contractor');
const Material = require('./models/Material');
const Booking = require('./models/Booking');
const KycApplication = require('./models/KycApplication');
const Dispute = require('./models/Dispute');
const Notification = require('./models/Notification');

const DB_FILE = path.join(__dirname, 'database.json');

let isMongoConnected = false;
let mongoConnectionError = null;
let cachedPromise = null;
let listenersBound = false;

function ensureConnectionListeners() {
  if (listenersBound) return;
  listenersBound = true;
  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
    cachedPromise = null;
  });
  mongoose.connection.on('error', (err) => {
    mongoConnectionError = err?.message || 'Mongo connection error';
    isMongoConnected = false;
    cachedPromise = null;
  });
}

async function connectDB() {
  ensureConnectionListeners();
  const mongoUri = (process.env.MONGODB_URI || '').trim();
  if (!mongoUri) {
    mongoConnectionError = 'MONGODB_URI environment variable is not set';
    isMongoConnected = false;
    console.warn('ℹ️ MONGODB_URI not configured; running with persistent Local Database (database.json).');
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return true;
  }

  if (cachedPromise) {
    try {
      await cachedPromise;
      isMongoConnected = mongoose.connection.readyState === 1;
      if (!isMongoConnected) cachedPromise = null;
      return isMongoConnected;
    } catch {
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

// Seed initial data from database.json into MongoDB safely per collection
async function seedMongoDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) return;
    const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

    if ((await User.countDocuments()) === 0 && Array.isArray(localData.users) && localData.users.length > 0) {
      await User.insertMany(localData.users, { ordered: false }).catch(() => {});
    }
    if ((await Contractor.countDocuments()) === 0 && Array.isArray(localData.contractors) && localData.contractors.length > 0) {
      await Contractor.insertMany(
        localData.contractors.map((c, idx) => ({ ...c, customId: c.customId || c.id || `c_seed_${idx}` })),
        { ordered: false }
      ).catch(() => {});
    }
    if ((await Material.countDocuments()) === 0 && Array.isArray(localData.materials) && localData.materials.length > 0) {
      await Material.insertMany(
        localData.materials.map((m, idx) => ({ ...m, customId: m.customId || m.id || `m_seed_${idx}` })),
        { ordered: false }
      ).catch(() => {});
    }
    if ((await Booking.countDocuments()) === 0 && Array.isArray(localData.bookings) && localData.bookings.length > 0) {
      const normalizedBookings = localData.bookings.map((b, idx) => {
        const labor = Math.max(0, Number(b.totalLaborAmount) || 0);
        const material = Math.max(0, Number(b.finalMaterialAmount) || 0);
        const total = Math.max(0, Number(b.grandTotal ?? (labor + material)) || 0);
        const advance = Math.min(total, Math.max(0, Number(b.escrowAdvanceToken) || 0));
        const mode = b.bookingMode || b.hiringType || 'दिहाड़ी';
        return {
          ...b,
          customId: b.customId || b.id || `b_seed_${idx}`,
          contractorId: b.contractorId || 'c1',
          contractorName: b.contractorName || 'SETU कारीगर',
          customerName: b.customerName || 'SETU ग्राहक',
          workAddress: b.workAddress || b.location || 'भोपाल, मध्य प्रदेश',
          bookingMode: ['दिहाड़ी', 'ठेका', 'क्विक रिपेयर', 'भाव_पूछें'].includes(mode) ? mode : 'दिहाड़ी',
          totalLaborAmount: labor,
          finalMaterialAmount: material,
          grandTotal: total,
          escrowAdvanceToken: advance,
          balanceOnOtpRelease: Math.max(0, Number(b.balanceOnOtpRelease ?? (total - advance)) || 0),
        };
      });
      await Booking.insertMany(normalizedBookings, { ordered: false }).catch(() => {});
    }
    if ((await KycApplication.countDocuments()) === 0 && Array.isArray(localData.kycApplications) && localData.kycApplications.length > 0) {
      await KycApplication.insertMany(
        localData.kycApplications.map((k, idx) => ({ ...k, customId: k.customId || k.id || `kyc_seed_${idx}` })),
        { ordered: false }
      ).catch(() => {});
    }
    if ((await Dispute.countDocuments()) === 0 && Array.isArray(localData.disputes) && localData.disputes.length > 0) {
      await Dispute.insertMany(
        localData.disputes.map((d, idx) => ({ ...d, customId: d.customId || d.id || `disp_seed_${idx}` })),
        { ordered: false }
      ).catch(() => {});
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
    modelsLoaded: ['User', 'Contractor', 'Material', 'Booking', 'KycApplication', 'Dispute', 'Notification'],
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
    Notification,
  },
};
