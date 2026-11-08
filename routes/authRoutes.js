const express = require('express');
const router = express.Router();

const Batch = require('../models/Batch');
const Branch = require('../models/Branch');
const DailyLog = require('../models/DailyLog');
const Farmer = require('../models/Farmer');
const Invoice = require('../models/Invoice');
const Item = require('../models/Item');
const LiftingLog = require('../models/LiftingLog');
const Trader = require('../models/Trader');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// ==========================================
// 1. FARMER ROUTES
// ==========================================

// Get All Farmers
router.get('/farmers', async (req, res) => {
    try {
        const farmers = await Farmer.find().lean();
        res.json(farmers);
    } catch (err) {
        console.error("Error fetching farmers:", err);
        res.status(500).json({ error: err.message });
    }
});

// Create New Farmer
router.post('/farmers', async (req, res) => {
    try {
        const newFarmer = new Farmer(req.body);
        const savedFarmer = await newFarmer.save();
        res.status(201).json(savedFarmer);
    } catch (err) {
        console.error("Error creating farmer:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get Farmer by ID
router.get('/farmers/:id', async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id).lean();
        if (!farmer) return res.status(404).json({ error: "Farmer not found" });
        res.json(farmer);
    } catch (err) {
        console.error("Error fetching farmer by ID:", err);
        res.status(500).json({ error: err.message });
    }
});

// Farmer Active Batches (Handling path variations to fix "Error loading batches!")
router.get('/farmer-batches/:farmerId', async (req, res) => {
    try {
        const { farmerId } = req.params;
        const chicks = await Batch.find({ 
            $or: [{ farmerId }, { farmer }, { farmer_id: farmerId }] 
        }).lean();
        
        res.json(chicks);
    } catch (err) {
        console.error("Error loading batches for farmer:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/api/farmer-batches/:farmerId', async (req, res) => {
    try {
        const { farmerId } = req.params;
        const chicks = await Batch.find({ 
            $or: [{ farmerId }, { farmer }, { farmer_id: farmerId }] 
        }).lean();
        
        res.json(chicks);
    } catch (err) {
        console.error("Error loading batches for farmer:", err);
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// 2. REPORTS & SUMMARY ROUTES
// ==========================================

// Batch-wise Summary Report
router.get('/reports/batch-summary', async (req, res) => {
    try {
        const chicks = await Batch.find().lean();
        const farmers = await Farmer.find().lean();
        const dailyLogs = await DailyLog.find().lean();
        const sales = await Transaction.find().lean();

        const farmerMap = {};
        farmers.forEach(f => {
            farmerMap[f._id.toString()] = f;
        });

        let report = chicks.map(c => {
            const batchNo = c.batchNo || c.batchNumber;
            const logs = dailyLogs.filter(d => d && d.batchNo === batchNo);
            const batchSales = sales.filter(s => s && s.batchNo === batchNo);

            const rawFarmerRef = c.farmerId || c.farmer || c.farmer_id;
            let farmerObj = null;
            if (rawFarmerRef) {
                const farmerKey = typeof rawFarmerRef === 'object' ? rawFarmerRef._id?.toString() : rawFarmerRef.toString();
                farmerObj = farmerMap[farmerKey] || (typeof rawFarmerRef === 'object' ? rawFarmerRef : null);
            }

            const totalMortality = logs.reduce((sum, l) => sum + (l.mortality || 0), 0);
            const totalFeedConsumed = logs.reduce((sum, l) => sum + (l.feedConsumedKg || l.feedConsumed || 0), 0);

            const totalSoldBirds = batchSales.reduce((sum, s) => sum + (s.birdsCount || s.quantity || 0), 0);
            const totalSoldWeight = batchSales.reduce((sum, s) => sum + (s.totalWeightKg || s.weight || 0), 0);
            const totalRevenue = batchSales.reduce((sum, s) => sum + (s.totalAmount || s.amount || 0), 0);

            const placedQty = c.quantity || c.placedChicks || 0;
            const liveBirds = placedQty - totalMortality - totalSoldBirds;
            const totalFeedIssued = c.feedIssued || totalFeedConsumed; 
            const closingFeed = totalFeedIssued - totalFeedConsumed;

            let latestBodyWeightGm = 0;
            if (logs.length > 0) {
                const sortedLogs = [...logs].sort((a, b) => (b.ageInDays || b.age || 0) - (a.ageInDays || a.age || 0));
                latestBodyWeightGm = sortedLogs[0].bodyWeightGm || sortedLogs[0].bodyWeight || 0;
            }

            const liveWeightKg = ((liveBirds * latestBodyWeightGm) / 1000);
            const totalEffectiveWeightKg = totalSoldWeight + liveWeightKg;
            const fcr = totalEffectiveWeightKg > 0 ? (totalFeedConsumed / totalEffectiveWeightKg).toFixed(2) : '0.00';
            const mortalityPercent = placedQty > 0 ? ((totalMortality / placedQty) * 100).toFixed(1) : '0.0';

            return {
                batchNo: batchNo,
                farmerName: farmerObj ? (farmerObj.name || farmerObj.farmerName) : (c.farmerName || 'N/A'),
                farmId: farmerObj ? (farmerObj.farmId || farmerObj.code) : (c.farmId || 'N/A'),
                branch: c.branch || (farmerObj && farmerObj.branch) || 'Main',
                placedChicks: placedQty,
                liveBirds: liveBirds >= 0 ? liveBirds : 0,
                totalMortality,
                mortalityPercent,
                totalFeedKg: totalFeedConsumed,
                totalFeedIssued,
                closingFeed: closingFeed >= 0 ? closingFeed : 0,
                totalSoldBirds,
                totalSoldWeight,
                totalRevenue,
                fcr
            };
        });

        res.json(report);
    } catch (err) {
        console.error("Batch Summary Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Branch-wise Performance Report
router.get('/reports/branch-summary', async (req, res) => {
    try {
        const chicks = await Batch.find().lean();
        const farmers = await Farmer.find().lean();
        const dailyLogs = await DailyLog.find().lean();
        const sales = await Transaction.find().lean();

        const farmerMap = {};
        farmers.forEach(f => {
            farmerMap[f._id.toString()] = f;
        });

        let branchMap = {};

        if (chicks && chicks.length > 0) {
            chicks.forEach(c => {
                if (!c) return;
                
                const rawFarmerRef = c.farmerId || c.farmer || c.farmer_id;
                let farmerObj = null;
                if (rawFarmerRef) {
                    const farmerKey = typeof rawFarmerRef === 'object' ? rawFarmerRef._id?.toString() : rawFarmerRef.toString();
                    farmerObj = farmerMap[farmerKey] || (typeof rawFarmerRef === 'object' ? rawFarmerRef : null);
                }

                const branchName = c.branch || (farmerObj && farmerObj.branch) || 'Main';

                if (!branchMap[branchName]) {
                    branchMap[branchName] = {
                        branch: branchName,
                        totalBatches: 0,
                        placedChicks: 0,
                        totalMortality: 0,
                        totalFeedIssued: 0,
                        totalFeedConsumed: 0,
                        totalSoldBirds: 0,
                        totalSoldWeight: 0,
                        totalRevenue: 0,
                        liveBirdsCount: 0
                    };
                }

                const batchNo = c.batchNo || c.batchNumber;
                const logs = dailyLogs.filter(d => d && d.batchNo === batchNo);
                const batchSales = sales.filter(s => s && s.batchNo === batchNo);

                const mortality = logs.reduce((sum, l) => sum + (l.mortality || 0), 0);
                const feedConsumed = logs.reduce((sum, l) => sum + (l.feedConsumedKg || l.feedConsumed || 0), 0);
                const soldBirds = batchSales.reduce((sum, s) => sum + (s.birdsCount || s.quantity || 0), 0);
                const soldWeight = batchSales.reduce((sum, s) => sum + (s.totalWeightKg || s.weight || 0), 0);
                const revenue = batchSales.reduce((sum, s) => sum + (s.totalAmount || s.amount || 0), 0);
                const placedQty = c.quantity || c.placedChicks || 0;

                branchMap[branchName].totalBatches += 1;
                branchMap[branchName].placedChicks += placedQty;
                branchMap[branchName].totalMortality += mortality;
                branchMap[branchName].totalFeedIssued += (c.feedIssued || feedConsumed);
                branchMap[branchName].totalFeedConsumed += feedConsumed;
                branchMap[branchName].totalSoldBirds += soldBirds;
                branchMap[branchName].totalSoldWeight += soldWeight;
                branchMap[branchName].totalRevenue += revenue;
                branchMap[branchName].liveBirdsCount += Math.max(0, placedQty - mortality - soldBirds);
            });
        }

        let branchReport = Object.values(branchMap).map(b => {
            let mortalityPercent = b.placedChicks > 0 ? ((b.totalMortality / b.placedChicks) * 100).toFixed(1) : '0.0';
            let fcr = b.totalSoldWeight > 0 ? (b.totalFeedConsumed / b.totalSoldWeight).toFixed(2) : '0.00';
            
            return {
                ...b,
                mortalityPercent,
                closingFeed: Math.max(0, b.totalFeedIssued - b.totalFeedConsumed),
                fcr
            };
        });

        res.json(branchReport);
    } catch (err) {
        console.error("Branch Summary Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Farmer Ledger Report Route
router.get('/reports/farmer-ledger/:farmerId', async (req, res) => {
    try {
        const { farmerId } = req.params;
        const { batchNo } = req.query;

        const farmer = await Farmer.findById(farmerId);
        let queryFilter = { $or: [{ farmerId }, { farmer }, { farmer_id: farmerId }] };
        if (batchNo && batchNo !== 'ALL') {
            queryFilter.batchNo = batchNo;
        }

        const chicks = await Batch.find(queryFilter);
        const feeds = []; 
        const dailyLogs = await DailyLog.find(queryFilter);
        const sales = await Transaction.find(queryFilter).populate('traderId', 'name marketArea');

        res.json({ farmer, chicks, feeds, dailyLogs, sales });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
