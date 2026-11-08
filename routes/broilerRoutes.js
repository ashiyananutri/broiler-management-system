const express = require('express');
const router = express.Router();

const Batch = require('../models/Batch');
const Branch = require('../models/Branch');
const DailyLog = require('../models/DailyLog');
const Farmer = require('../models/Farmer');
const Item = require('../models/Item');
const Trader = require('../models/Trader');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// ==========================================
// MASTER CREATION ROUTES
// ==========================================

router.get('/branches', async (req, res) => {
    try { res.json(await Branch.find().lean()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/branches', async (req, res) => {
    try { const item = new Branch(req.body); res.status(201).json(await item.save()); } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/traders', async (req, res) => {
    try { res.json(await Trader.find().lean()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/traders', async (req, res) => {
    try { const item = new Trader(req.body); res.status(201).json(await item.save()); } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/items', async (req, res) => {
    try { res.json(await Item.find().lean()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/items', async (req, res) => {
    try { const item = new Item(req.body); res.status(201).json(await item.save()); } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/users', async (req, res) => {
    try { res.json(await User.find().lean()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/users', async (req, res) => {
    try { const item = new User(req.body); res.status(201).json(await item.save()); } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/farmers', async (req, res) => {
    try { res.json(await Farmer.find().lean()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/farmers', async (req, res) => {
    try { const item = new Farmer(req.body); res.status(201).json(await item.save()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/farmers/:id', async (req, res) => {
    try { 
        const item = await Farmer.findById(req.params.id).lean(); 
        if (!item) return res.status(404).json({ error: "Farmer not found" });
        res.json(item); 
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Flexible Farmer Active Batches Route
router.get(['/farmer-batches/:farmerId', '/api/farmer-batches/:farmerId'], async (req, res) => {
    try {
        const { farmerId } = req.params;
        const chicks = await Batch.find({ 
            $or: [
                { farmerId: farmerId },
                { farmer: farmerId },
                { farmer_id: farmerId },
                { "farmer._id": farmerId }
            ] 
        }).lean();
        
        res.json(chicks);
    } catch (err) { 
        console.error("Error loading batches for farmer:", err);
        res.status(500).json({ error: err.message }); 
    }
});


// ==========================================
// ENTRY & TRANSACTION ROUTES
// ==========================================

router.get('/batches', async (req, res) => {
    try { res.json(await Batch.find().lean()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/batches', async (req, res) => {
    try { const item = new Batch(req.body); res.status(201).json(await item.save()); } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/dailylogs', async (req, res) => {
    try { const item = new DailyLog(req.body); res.status(201).json(await item.save()); } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/transactions', async (req, res) => {
    try { res.json(await Transaction.find().lean()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/transactions', async (req, res) => {
    try { const item = new Transaction(req.body); res.status(201).json(await item.save()); } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// REPORTS & SUMMARY ROUTES
// ==========================================

router.get('/reports/batch-summary', async (req, res) => {
    try {
        const chicks = await Batch.find().lean();
        const farmers = await Farmer.find().lean();
        const dailyLogs = await DailyLog.find().lean();
        const sales = await Transaction.find().lean();

        const farmerMap = {};
        farmers.forEach(f => { farmerMap[f._id.toString()] = f; });

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
        res.status(500).json({ error: err.message });
    }
});

router.get('/reports/branch-summary', async (req, res) => {
    try {
        const chicks = await Batch.find().lean();
        const farmers = await Farmer.find().lean();
        const dailyLogs = await DailyLog.find().lean();
        const sales = await Transaction.find().lean();

        const farmerMap = {};
        farmers.forEach(f => { farmerMap[f._id.toString()] = f; });

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
                        branch: branchName, totalBatches: 0, placedChicks: 0, totalMortality: 0,
                        totalFeedIssued: 0, totalFeedConsumed: 0, totalSoldBirds: 0, totalSoldWeight: 0,
                        totalRevenue: 0, liveBirdsCount: 0
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
            return { ...b, mortalityPercent, closingFeed: Math.max(0, b.totalFeedIssued - b.totalFeedConsumed), fcr };
        });

        res.json(branchReport);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/reports/farmer-ledger/:farmerId', async (req, res) => {
    try {
        const { farmerId } = req.params;
        const { batchNo } = req.query;

        const farmer = await Farmer.findById(farmerId);
        let queryFilter = { $or: [{ farmerId }, { farmer }, { farmer_id: farmerId }] };
        if (batchNo && batchNo !== 'ALL') { queryFilter.batchNo = batchNo; }

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
