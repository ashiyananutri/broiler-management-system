const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'supervisor'], default: 'supervisor' },
  branch: { type: String, required: true, default: 'Main Branch' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);