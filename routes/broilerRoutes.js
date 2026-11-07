const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Item = require('../models/Item');

// --- BRANCH ROUTES ---
router.get('/branches', async (req, res) => res.json(await Branch.find()));
router.post('/branches', async (req, res) => {
    try { const b = new Branch(req.body); await b.save(); res.status(201).json(b); } catch(e){ res.status(500).json({error: e.message}); }
});
router.put('/branches/:id', async (req, res) => res.json(await Branch.findByIdAndUpdate(req.params.id, req.body, {new: true})));
router.delete('/branches/:id', async (req, res) => { await Branch.findByIdAndDelete(req.params.id); res.json({message: "Deleted"}); });

// --- FARMER ROUTES ---
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

// --- TRADER ROUTES ---
router.get('/traders', async (req, res) => res.json(await Trader.find()));
router.post('/traders', async (req, res) => {
    try { const t = new Trader(req.body); await t.save(); res.status(201).json(t); } catch(e){ res.status(500).json({error: e.message}); }
});
router.put('/traders/:id', async (req, res) => res.json(await Trader.findByIdAndUpdate(req.params.id, req.body, {new: true})));
router.delete('/traders/:id', async (req, res) => { await Trader.findByIdAndDelete(req.params.id); res.json({message: "Deleted"}); });

// --- ITEM ROUTES ---
router.get('/items', async (req, res) => res.json(await Item.find()));
router.post('/items', async (req, res) => {
    try { const i = new Item(req.body); await i.save(); res.status(201).json(i); } catch(e){ res.status(500).json({error: e.message}); }
});
router.put('/items/:id', async (req, res) => res.json(await Item.findByIdAndUpdate(req.params.id, req.body, {new: true})));
router.delete('/items/:id', async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.json({message: "Deleted"}); });

module.exports = router;
