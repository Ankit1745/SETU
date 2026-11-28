const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  firebaseUid: { type: String, default: '' },
  name: { type: String, default: 'नया उपयोगकर्ता' },
  role: { type: String, enum: ['CUSTOMER', 'CONTRACTOR', 'VENDOR', 'ADMIN'], default: 'CUSTOMER' },
  setuId: { type: String, required: true, unique: true },
  tradeOrShop: { type: String, default: '' },
  category: { type: String, default: '' },
  kycVerified: { type: Boolean, default: false },
  rewardPoints: { type: Number, default: 250 },
  location: { type: String, default: 'भोपाल, मध्य प्रदेश' },
  contractorId: { type: String, default: '' },
  vendorId: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  idProofUrl: { type: String, default: '' },
  passwordHash: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
