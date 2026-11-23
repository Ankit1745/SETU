const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  customId: { type: String, unique: true },
  vendorId: { type: String, default: '' },
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  category: { type: String, required: true },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  unit: { type: String, required: true },
  bulkOffer: { type: String, default: '' },
  storeName: { type: String, required: true },
  storeDistance: { type: String, default: '1.0 km दूर' },
  inStock: { type: Boolean, default: true },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Material || mongoose.model('Material', MaterialSchema);
