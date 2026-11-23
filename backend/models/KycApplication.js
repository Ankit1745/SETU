const mongoose = require('mongoose');

const KycApplicationSchema = new mongoose.Schema({
  customId: { type: String, unique: true },
  userId: { type: String, default: '' },
  name: { type: String, required: true },
  role: { type: String, enum: ['CONTRACTOR', 'VENDOR'], required: true },
  tradeOrShop: { type: String, required: true },
  phone: { type: String, required: true },
  docType: { type: String, default: 'AADHAAR' },
  docNumber: { type: String, required: true }, // Masked e.g. XXXX-XXXX-1234
  docFilePath: { type: String, default: '' }, // Private file path in uploads/private/
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  appliedDate: { type: String, default: () => new Date().toLocaleDateString('hi-IN') },
  reviewerNotes: { type: String, default: '' },
  reviewedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.KycApplication || mongoose.model('KycApplication', KycApplicationSchema);
