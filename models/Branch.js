const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    farmId: { type: String, required: true, unique: true },
    branch: { type: String, required: true },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    village: { type: String, required: true },
    shedCapacity: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);
