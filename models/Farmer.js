const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  farmId: { type: String, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  village: { type: String, required: true },
  shedCapacity: { type: Number, required: true },
  branch: { type: String, required: true },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Farmer', farmerSchema);