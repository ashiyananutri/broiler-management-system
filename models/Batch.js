const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  chicksPlaced: { type: Number, required: true },
  feedType: { type: String, required: true },
  placementDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Harvested', 'Closed'], default: 'Active' },
  mortalityCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', batchSchema);