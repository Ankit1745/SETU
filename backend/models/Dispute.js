const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema({
  customId: { type: String, unique: true },
  customerName: { type: String, required: true },
  contractorName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  escrowAmount: { type: Number, required: true },
  issueDescription: { type: String, required: true },
  status: { type: String, enum: ['OPEN', 'RESOLVED', 'REFUNDED'], default: 'OPEN' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Dispute || mongoose.model('Dispute', DisputeSchema);
