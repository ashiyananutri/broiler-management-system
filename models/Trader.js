const mongoose = require('mongoose');
const traderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  marketArea: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Trader', traderSchema);