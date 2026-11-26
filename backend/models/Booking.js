const mongoose = require('mongoose');
const crypto = require('crypto');

const QuotationSchema = new mongoose.Schema({
  dailyWageRate: { type: Number, default: null },
  helperRate: { type: Number, default: null },
  contractUnitRate: { type: Number, default: null },
  daysOrUnits: { type: Number, default: 1 },
  totalLaborAmount: { type: Number, required: true },
  materialAmount: { type: Number, default: 0 },
  platformFee: { type: Number, default: 35 },
  grandTotal: { type: Number, required: true },
  advanceToken: { type: Number, required: true },
  balanceOnCompletion: { type: Number, required: true },
  notes: { type: String, default: '' },
  lockedAt: { type: Date, default: null },
}, { _id: false });

const RevisedQuotationSchema = new mongoose.Schema({
  previousGrandTotal: { type: Number, required: true },
  newGrandTotal: { type: Number, required: true },
  laborChange: { type: Number, default: 0 },
  materialChange: { type: Number, default: 0 },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PROPOSED', 'ACCEPTED', 'REJECTED'], default: 'PROPOSED' },
  proposedAt: { type: Date, default: Date.now },
  decidedAt: { type: Date, default: null },
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  customId: { type: String, unique: true },
  idempotencyKey: { type: String, sparse: true, unique: true },
  customerId: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  customerName: { type: String, required: true },
  contractorId: { type: String, required: true },
  contractorName: { type: String, required: true },
  contractorPhone: { type: String, default: '' },
  bookingMode: { type: String, enum: ['दिहाड़ी', 'ठेका', 'क्विक रिपेयर', 'भाव_पूछें'], default: 'दिहाड़ी' },
  paymentMethod: { type: String, enum: ['CASH', 'ONLINE_ESCROW'], default: 'CASH' },
  paymentStatus: { type: String, enum: ['PENDING', 'ADVANCE_PAID', 'FULLY_PAID', 'REFUNDED'], default: 'PENDING' },
  contractorPlatformFee: { type: Number, default: 35 }, // Cash: flat ₹35, Online: 5%
  workType: String,
  workAddress: { type: String, required: true },
  
  // Rate & Financials
  totalLaborAmount: { type: Number, required: true },
  finalMaterialAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  escrowAdvanceToken: { type: Number, required: true }, // Capped at <= grandTotal
  balanceOnOtpRelease: { type: Number, required: true },
  
  // Quotations & Price Locking Flow
  quotation: { type: QuotationSchema, default: null },
  isPriceLocked: { type: Boolean, default: false },
  revisedQuotation: { type: RevisedQuotationSchema, default: null },
  
  // Status transitions
  status: {
    type: String,
    enum: [
      'REQUESTED',     // Customer requested initial quote/estimate
      'QUOTED',        // Contractor sent formal quotation
      'APPROVED',      // Customer approved quotation (Price locked)
      'PENDING',       // Waiting for contractor start/acceptance
      'ACCEPTED',      // Contractor confirmed site visit
      'IN_PROGRESS',   // Work is currently ongoing
      'COMPLETED',     // Finished, OTP verified
      'DISPUTED',      // Raised dispute
      'CANCELLED',     // Cancelled before start
      'REJECTED',      // Contractor rejected initial request
    ],
    default: 'PENDING',
  },
  
  // Security & Completion
  completionOtp: {
    type: String,
    default: () => crypto.randomInt(1000, 10000).toString(),
  },
  isFeeDeducted: { type: Boolean, default: false }, // Ensures idempotent wallet deduction
  
  attachedMedia: [{
    type: { type: String, enum: ['photo', 'video'] },
    title: String,
    url: String,
  }],
  includeMaterialsCombo: { type: Boolean, default: false },
  description: String,
  date: { type: String, default: () => new Date().toLocaleDateString('hi-IN') },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
