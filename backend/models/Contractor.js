const mongoose = require('mongoose');
const { VALID_CONTRACTOR_CATEGORIES } = require('../tradeRateRules');

const PortfolioPhotoSchema = new mongoose.Schema({
  id: String,
  title: String,
  imageUrl: String,
  date: String,
  description: String,
});

const ReviewSchema = new mongoose.Schema({
  id: String,
  customerName: String,
  rating: { type: Number, required: true },
  date: String,
  comment: String,
  workDone: String,
  location: String,
  verifiedWork: { type: Boolean, default: true },
});

const WorkVideoSchema = new mongoose.Schema({
  id: String,
  title: String,
  thumbnail: String,
  duration: String,
  date: String,
  type: { type: String, enum: ['WALKTHROUGH', 'CUSTOMER_TESTIMONIAL'], default: 'WALKTHROUGH' },
  author: String,
  videoUrl: String,
});

const RecommendedMaterialSchema = new mongoose.Schema({
  id: String,
  name: String,
  brand: String,
  category: String,
  mrp: Number,
  sellingPrice: Number,
  unit: String,
  bulkOffer: String,
  storeName: String,
  storeDistance: String,
  inStock: { type: Boolean, default: true },
  image: String,
});

const ContractorSchema = new mongoose.Schema({
  customId: { type: String, unique: true, required: true },
  userId: { type: String }, // Links to User account
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: VALID_CONTRACTOR_CATEGORIES,
  },
  mainCategory: { type: String, default: '' },
  subCategory: { type: String, default: '' },
  specialtyHindi: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  // SETU Rule: Do not assign 5-star rating, 5yr experience, or verified badge to new contractors by default!
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  experienceYears: { type: Number, default: 0 },
  jobsCompleted: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }, // Only true after Admin KYC approval
  distance: { type: String, default: '' },
  city: { type: String, default: '' },
  locality: { type: String, default: '' },
  etaMinutes: { type: Number, default: null },
  isQuickAvailable: { type: Boolean, default: false },

  // Optional bank / payout fields (editable anytime from partner dashboard)
  accountHolderName: { type: String, default: '' },
  bankAccount: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  upiId: { type: String, default: '' },
  
  // SETU Rate Rule: Contractor sets own rates. Empty / null means "भाव पूछें".
  primaryRateType: { type: String, default: 'दिहाड़ी' },
  dailyWageRate: { type: Number, default: null }, // Nullable: null means "भाव पूछें"
  helperRate: { type: Number, default: null },    // Nullable: null means "भाव पूछें"
  contractUnitRate: { type: Number, default: null }, // Nullable: null means "भाव पूछें"
  unitLabel: { type: String, default: 'प्रति काम' },
  additionalRateCards: [{ title: String, rate: String }],
  tradeRateSpec: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  walletBalance: { type: Number, default: 0 }, // Verified wallet balance
  available: { type: Boolean, default: true },
  phone: { type: String }, // Real contact phone (private)
  phoneMasked: { type: String },
  skills: [{ type: String }],
  portfolioPhotos: [PortfolioPhotoSchema],
  videos: [WorkVideoSchema],
  reviews: [ReviewSchema],
  recommendedMaterials: [RecommendedMaterialSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Contractor || mongoose.model('Contractor', ContractorSchema);
