const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['Feed', 'Medicine', 'Chicks', 'Accessories'], required: true },
    unit: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Item', itemSchema);
