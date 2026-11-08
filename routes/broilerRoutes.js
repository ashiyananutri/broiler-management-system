const express = require('express');
const router = express.Router();

// ⚠️ Agar aapke models 'model.js' me hain toh yahi rehne dein, 
// warna apni model file ka sahi naam yahan daal dein (jaise '../models/db' ya '../models/Broiler')
const { ChicksEntry, FeedRequest, DailyEntry, SaleEntry, Branch, Farmer, Trader, Item } = require('../models/model');

// 1. Batch-wise Summary Report
router.get('/reports/batch-summary', async (req, res) => {
    try {
        const chicks = await ChicksEntry.find().populate('farmerId', 'name farmId branch');
        const dailyLogs = await DailyEntry.find();
        const feedRequests = await FeedRequest.find();
        const sales = await SaleEntry.find();

        let report = chicks.map(c => {
            const batchNo = c.batchNo;
            const logs = dailyLogs.filter(d => d.batchNo === batchNo);
            const batchFeeds = feedRequests.filter(f => f.batchNo === batchNo);
            const batchSales = sales.filter(s => s.batchNo === batchNo);

            const totalMortality = logs.reduce((sum, l) => sum + (l.mortality || 0), 0);
            const totalFeedIssued = batchFeeds.reduce((sum, f) => sum + (f.quantity || 0), 0);
            const totalFeedConsumed = logs.reduce((sum, l) => sum + (l.feedConsumedKg || 0), 0);

            const totalSoldBirds = batchSales.reduce((sum, s) => sum + (s.birdsCount || 0), 0);
            const totalSoldWeight = batchSales.reduce((sum, s) => sum + (s.totalWeightKg || 0), 0);
            const totalRevenue = batchSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

            const liveBirds = c.quantity - totalMortality - totalSoldBirds;
            const closingFeed = totalFeedIssued - totalFeedConsumed;

            let latestBodyWeightGm = 0;
            if (logs.length > 0) {
                const sortedLogs = [...logs].sort((a, b) => (b.ageInDays || 0) - (a.ageInDays || 0));
                latestBodyWeightGm = sortedLogs[0].bodyWeightGm || 0;
            }

            const liveWeightKg = ((liveBirds * latestBodyWeightGm) / 1000);
            const totalEffectiveWeightKg = totalSoldWeight + liveWeightKg;
            const fcr = totalEffectiveWeightKg > 0 ? (totalFeedConsumed / totalEffectiveWeightKg).toFixed(2) : '0.00';
            const mortalityPercent = c.quantity > 0 ? ((totalMortality / c.quantity) * 100).toFixed(1) : '0.0';

            return {
                batchNo: c.batchNo,
                farmerName: c.farmerId ? c.farmerId.name : 'N/A',
                farmId: c.farmerId ? c.farmerId.farmId : 'N/A',
                branch: c.branch || (c.farmerId && c.farmerId.branch) || 'Main',
                placedChicks: c.quantity,
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

// 2. Branch-wise Performance Report
router.get('/reports/branch-summary', async (req, res) => {
    try {
        const chicks = await ChicksEntry.find().populate('farmerId', 'name farmId branch');
        const dailyLogs = await DailyEntry.find();
        const feedRequests = await FeedRequest.find();
        const sales = await SaleEntry.find();

        let branchMap = {};

        chicks.forEach(c => {
            const branchName = c.branch || (c.farmerId && c.farmerId.branch) || 'Main';

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

            const batchNo = c.batchNo;
            const logs = dailyLogs.filter(d => d.batchNo === batchNo);
            const batchFeeds = feedRequests.filter(f => f.batchNo === batchNo);
            const batchSales = sales.filter(s => s.batchNo === batchNo);

            const mortality = logs.reduce((sum, l) => sum + (l.mortality || 0), 0);
            const feedIssued = batchFeeds.reduce((sum, f) => sum + (f.quantity || 0), 0);
            const feedConsumed = logs.reduce((sum, l) => sum + (l.feedConsumedKg || 0), 0);
            const soldBirds = batchSales.reduce((sum, s) => sum + (s.birdsCount || 0), 0);
            const soldWeight = batchSales.reduce((sum, s) => sum + (s.totalWeightKg || 0), 0);
            const revenue = batchSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

            branchMap[branchName].totalBatches += 1;
            branchMap[branchName].placedChicks += c.quantity;
            branchMap[branchName].totalMortality += mortality;
            branchMap[branchName].totalFeedIssued += feedIssued;
            branchMap[branchName].totalFeedConsumed += feedConsumed;
            branchMap[branchName].totalSoldBirds += soldBirds;
            branchMap[branchName].totalSoldWeight += soldWeight;
            branchMap[branchName].totalRevenue += revenue;
            branchMap[branchName].liveBirdsCount += (c.quantity - mortality - soldBirds);
        });

        let branchReport = Object.values(branchMap).map(b => {
            let mortalityPercent = b.placedChicks > 0 ? ((b.totalMortality / b.placedChicks) * 100).toFixed(1) : '0.0';
            let fcr = b.totalSoldWeight > 0 ? (b.totalFeedConsumed / b.totalSoldWeight).toFixed(2) : '0.00';
            
            return {
                ...b,
                mortalityPercent,
                closingFeed: (b.totalFeedIssued - b.totalFeedConsumed) >= 0 ? (b.totalFeedIssued - b.totalFeedConsumed) : 0,
                fcr
            };
        });

        res.json(branchReport);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Farmer Ledger Report Route
router.get('/reports/farmer-ledger/:farmerId', async (req, res) => {
    try {
        const { farmerId } = req.params;
        const { batchNo } = req.query;

        const farmer = await Farmer.findById(farmerId).populate('supervisorId', 'name branch');
        let queryFilter = { farmerId };
        if (batchNo && batchNo !== 'ALL') {
            queryFilter.batchNo = batchNo;
        }

        const chicks = await ChicksEntry.find(queryFilter);
        const feeds = await FeedRequest.find(queryFilter).populate('itemId', 'name unit');
        const dailyLogs = await DailyEntry.find(queryFilter);
        const sales = await SaleEntry.find(queryFilter).populate('traderId', 'name marketArea');

        res.json({ farmer, chicks, feeds, dailyLogs, sales });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Farmer Active Batches Route
router.get('/farmer-batches/:farmerId', async (req, res) => {
    try {
        const { farmerId } = req.params;
        const chicks = await ChicksEntry.find({ farmerId });
        res.json(chicks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
