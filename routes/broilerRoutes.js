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


// --- TRANSACTION / ENTRY ROUTES ---

// 1. Chicks Entry
router.post('/chicks-entry', async (req, res) => {
    try {
        const count = await ChicksEntry.countDocuments();
        const batchNo = `BATCH-${String(count + 1).padStart(3, '0')}`;
        
        let entryData = { ...req.body, batchNo };
        if (!entryData.date) entryData.date = new Date();

        const entry = new ChicksEntry(entryData);
        await entry.save();
        res.status(201).json({ message: 'Chicks entry saved successfully!', entry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Feed Out Request
router.post('/feed-request', async (req, res) => {
    try {
        const { branch, farmerId, batchNo, itemId, quantity, sentBy, date } = req.body;
        const farmer = await Farmer.findById(farmerId);
        if (!farmer || !farmer.supervisorId) {
            return res.status(400).json({ message: 'Farmer has no assigned supervisor!' });
        }

        let feedData = {
            branch, farmerId, batchNo, itemId, quantity, sentBy,
            supervisorId: farmer.supervisorId,
            status: 'Pending'
        };
        if (date) feedData.date = date;

        const feedReq = new FeedRequest(feedData);
        await feedReq.save();
        res.status(201).json({ message: 'Feed sent for supervisor approval successfully!', feedReq });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Daily Entry
router.post('/daily-entry', async (req, res) => {
    try {
        let entryData = { ...req.body };
        if (!entryData.date) entryData.date = new Date();

        const entry = new DailyEntry(entryData);
        await entry.save();
        res.status(201).json({ message: 'Daily log recorded successfully!', entry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Sale Entry
router.post('/sale-entry', async (req, res) => {
    try {
        const { branch, farmerId, batchNo, traderId, birdsCount, totalWeightKg, ratePerKg, soldBy, date } = req.body;
        const totalAmount = totalWeightKg * ratePerKg;
        
        let saleData = {
            branch, farmerId, batchNo, traderId, birdsCount, totalWeightKg, ratePerKg, totalAmount, soldBy
        };
        if (date) saleData.date = date;

        const sale = new SaleEntry(saleData);
        await sale.save();
        res.status(201).json({ message: 'Sale entry recorded successfully!', sale });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
