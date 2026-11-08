const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Item = require('../models/Item');
const { ChicksEntry, FeedRequest, DailyEntry, SaleEntry } = require('../models/Transaction');

// --- MASTER ROUTES ---
router.get('/branches', async (req, res) => res.json(await Branch.find()));
router.post('/branches', async (req, res) => {
    try { const b = new Branch(req.body); await b.save(); res.status(201).json(b); } catch(e){ res.status(500).json({error: e.message}); }
});
router.put('/branches/:id', async (req, res) => res.json(await Branch.findByIdAndUpdate(req.params.id, req.body, {new: true})));
router.delete('/branches/:id', async (req, res) => { await Branch.findByIdAndDelete(req.params.id); res.json({message: "Deleted"}); });

router.get('/farmers', async (req, res) => res.json(await Farmer.find().populate('supervisorId', 'name branch')));
router.post('/farmers', async (req, res) => {
    try {
        const count = await Farmer.countDocuments();
        const farmId = `FARM-${String(count + 1).padStart(3, '0')}`;
        const f = new Farmer({ ...req.body, farmId });
        await f.save();
        res.status(201).json(f);
    } catch(e){ res.status(500).json({error: e.message}); }
});
router.put('/farmers/:id', async (req, res) => res.json(await Farmer.findByIdAndUpdate(req.params.id, req.body, {new: true})));
router.delete('/farmers/:id', async (req, res) => { await Farmer.findByIdAndDelete(req.params.id); res.json({message: "Deleted"}); });

router.get('/traders', async (req, res) => res.json(await Trader.find()));
router.post('/traders', async (req, res) => {
    try { const t = new Trader(req.body); await t.save(); res.status(201).json(t); } catch(e){ res.status(500).json({error: e.message}); }
});
router.put('/traders/:id', async (req, res) => res.json(await Trader.findByIdAndUpdate(req.params.id, req.body, {new: true})));
router.delete('/traders/:id', async (req, res) => { await Trader.findByIdAndDelete(req.params.id); res.json({message: "Deleted"}); });

router.get('/items', async (req, res) => res.json(await Item.find()));
router.post('/items', async (req, res) => {
    try { const i = new Item(req.body); await i.save(); res.status(201).json(i); } catch(e){ res.status(500).json({error: e.message}); }
});
router.put('/items/:id', async (req, res) => res.json(await Item.findByIdAndUpdate(req.params.id, req.body, {new: true})));
router.delete('/items/:id', async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.json({message: "Deleted"}); });


// --- HELPER: GET BATCHES WITH PLACEMENT DATE ---
router.get('/farmer-batches/:farmerId', async (req, res) => {
    try {
        const batches = await ChicksEntry.find({ farmerId: req.params.farmerId }, 'batchNo quantity date createdAt');
        res.json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- TRANSACTION ROUTES ---

// 1. Chicks Entry
router.get('/chicks-entry', async (req, res) => {
    res.json(await ChicksEntry.find().populate('farmerId', 'name farmId branch'));
});
router.post('/chicks-entry', async (req, res) => {
    try {
        const count = await ChicksEntry.countDocuments();
        const batchNo = `BATCH-${String(count + 1).padStart(3, '0')}`;
        let entryData = { ...req.body, batchNo };
        if (!entryData.date) entryData.date = new Date();
        const entry = new ChicksEntry(entryData);
        await entry.save();
        res.status(201).json({ message: 'Chicks entry saved successfully!', entry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/chicks-entry/:id', async (req, res) => {
    try { await ChicksEntry.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Feed Out Request
router.get('/feed-request', async (req, res) => {
    res.json(await FeedRequest.find().populate('farmerId', 'name').populate('itemId', 'name unit'));
});
router.post('/feed-request', async (req, res) => {
    try {
        const { branch, farmerId, batchNo, itemId, quantity, sentBy, date } = req.body;
        const farmer = await Farmer.findById(farmerId);
        if (!farmer || !farmer.supervisorId) {
            return res.status(400).json({ message: 'Farmer has no assigned supervisor!' });
        }
        let feedData = { branch, farmerId, batchNo, itemId, quantity, sentBy, supervisorId: farmer.supervisorId, status: 'Accepted' };
        if (date) feedData.date = date;
        const feedReq = new FeedRequest(feedData);
        await feedReq.save();
        res.status(201).json({ message: 'Feed issued successfully!', feedReq });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/feed-request/:id', async (req, res) => {
    try { await FeedRequest.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Daily Entry
router.get('/daily-entry', async (req, res) => {
    res.json(await DailyEntry.find().populate('farmerId', 'name'));
});
router.post('/daily-entry', async (req, res) => {
    try {
        let entryData = { ...req.body };
        if (!entryData.date) entryData.date = new Date();
        const entry = new DailyEntry(entryData);
        await entry.save();
        res.status(201).json({ message: 'Daily log recorded successfully!', entry });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/daily-entry/:id', async (req, res) => {
    try { await DailyEntry.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Sale Entry
router.get('/sale-entry', async (req, res) => {
    res.json(await SaleEntry.find().populate('farmerId', 'name').populate('traderId', 'name'));
});
router.post('/sale-entry', async (req, res) => {
    try {
        const { branch, farmerId, batchNo, traderId, birdsCount, totalWeightKg, ratePerKg, soldBy, date } = req.body;
        const totalAmount = totalWeightKg * ratePerKg;
        let saleData = { branch, farmerId, batchNo, traderId, birdsCount, totalWeightKg, ratePerKg, totalAmount, soldBy };
        if (date) saleData.date = date;
        const sale = new SaleEntry(saleData);
        await sale.save();
        res.status(201).json({ message: 'Sale entry recorded successfully!', sale });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/sale-entry/:id', async (req, res) => {
    try { await SaleEntry.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});


// --- REPORTS API ---

// 1. Batch-wise Summary Report (FCR, Mortality %, Feed Issued, Closing Feed, Live Birds)
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
            
            // Total Feed Issued from Godown (`FeedRequest`)
            const totalFeedIssued = batchFeeds.reduce((sum, f) => sum + (f.quantity || 0), 0);
            const dailyFeedConsumed = logs.reduce((sum, l) => sum + (l.feedConsumedKg || 0), 0);
            const totalFeedKg = totalFeedIssued > 0 ? totalFeedIssued : dailyFeedConsumed;

            const totalSoldBirds = batchSales.reduce((sum, s) => sum + (s.birdsCount || 0), 0);
            const totalSoldWeight = batchSales.reduce((sum, s) => sum + (s.totalWeightKg || 0), 0);
            const totalRevenue = batchSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

            // Live Birds Calculation
            const liveBirds = c.quantity - totalMortality - totalSoldBirds;

            // Closing Feed Calculation
            const closingFeed = totalFeedIssued - dailyFeedConsumed;

            // Calculate FCR = Total Feed Consumed (Kg) / Total Weight Sold (Kg)
            const fcr = totalSoldWeight > 0 ? (totalFeedKg / totalSoldWeight).toFixed(2) : '0.00';
            const mortalityPercent = c.quantity > 0 ? ((totalMortality / c.quantity) * 100).toFixed(1) : '0.0';

            return {
                batchNo: c.batchNo,
                farmerName: c.farmerId ? c.farmerId.name : 'N/A',
                farmId: c.farmerId ? c.farmerId.farmId : 'N/A',
                branch: c.branch,
                placedChicks: c.quantity,
                liveBirds: liveBirds >= 0 ? liveBirds : 0,
                totalMortality,
                mortalityPercent,
                totalFeedKg,
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

// 2. Comprehensive Farmer Ledger
router.get('/reports/farmer-ledger/:farmerId', async (req, res) => {
    try {
        const farmerId = req.params.farmerId;
        const farmer = await Farmer.findById(farmerId);
        const chicks = await ChicksEntry.find({ farmerId });
        const feeds = await FeedRequest.find({ farmerId }).populate('itemId', 'name unit');
        const dailyLogs = await DailyEntry.find({ farmerId });
        const sales = await SaleEntry.find({ farmerId }).populate('traderId', 'name');

        res.json({
            farmer,
            chicks,
            feeds,
            dailyLogs,
            sales
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
