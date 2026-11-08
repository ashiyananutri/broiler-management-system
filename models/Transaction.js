const mongoose = require('mongoose');

// 1. Chicks Entry Schema
const chicksEntrySchema = new mongoose.Schema({
    branch: { type: String, required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    batchNo: { type: String, required: true },
    quantity: { type: Number, required: true },
    hatchery: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// 2. Feed Transfer Request Schema
const feedRequestSchema = new mongoose.Schema({
    branch: { type: String, required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    batchNo: { type: String, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// 3. Daily Batch Entry Schema
const dailyEntrySchema = new mongoose.Schema({
    branch: { type: String, required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    batchNo: { type: String, required: true },
    ageInDays: { type: Number, required: true },
    mortality: { type: Number, default: 0 },
    feedConsumedKg: { type: Number, default: 0 },
    bodyWeightGm: { type: Number, default: 0 },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// 4. Sale Entry Schema
const saleEntrySchema = new mongoose.Schema({
    branch: { type: String, required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    batchNo: { type: String, required: true },
    traderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trader', required: true },
    birdsCount: { type: Number, required: true },
    totalWeightKg: { type: Number, required: true },
    ratePerKg: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = {
    ChicksEntry: mongoose.model('ChicksEntry', chicksEntrySchema),
    FeedRequest: mongoose.model('FeedRequest', feedRequestSchema),
    DailyEntry: mongoose.model('DailyEntry', dailyEntrySchema),
    SaleEntry: mongoose.model('SaleEntry', saleEntrySchema)
};
