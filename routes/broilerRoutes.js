const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const Trader = require('../models/Trader');
const Item = require('../models/Item');
const Branch = require('../models/Branch');

// --- BRANCH ROUTES ---
router.get('/branches', async (req, res) => {
    try { const data = await Branch.find(); res.json(data); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/branches', async (req, res) => {
    try { const item = new Branch(req.body); await item.save(); res.status(201).json({ message: 'Branch created successfully!', data: item }); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/branches/:id', async (req, res) => {
    try { const updated = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ message: 'Branch updated successfully!', data: updated }); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/branches/:id', async (req, res) => {
    try { await Branch.findByIdAndDelete(req.params.id); res.json({ message: 'Branch deleted successfully!' }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- FARMER ROUTES ---
router.get('/farmers', async (req, res) => {
    try { const data = await Farmer.find().populate('supervisorId', 'name branch'); res.json(data); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/farmers', async (req, res) => {
    try {
        const { name, phone, village, shedCapacity, branch, supervisorId } = req.body;
        const branchCode = (branch || 'GEN').substring(0, 3).toUpperCase();
        const nameCode = (name || 'FRM').substring(0, 3).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const farmId = `${branchCode}-${nameCode}-${randomNum}`;
        const newFarmer = new Farmer({ farmId, name, phone, village, shedCapacity, branch, supervisorId });
        await newFarmer.save();
        res.status(201).json({ message: 'Farmer created with ID: ' + farmId, data: newFarmer });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/farmers/:id', async (req, res) => {
    try { const updated = await Farmer.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ message: 'Farmer updated successfully!', data: updated }); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/farmers/:id', async (req, res) => {
    try { await Farmer.findByIdAndDelete(req.params.id); res.json({ message: 'Farmer deleted successfully!' }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- TRADER ROUTES ---
router.get('/traders', async (req, res) => {
    try { const data = await Trader.find(); res.json(data); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/traders', async (req, res) => {
    try { const item = new Trader(req.body); await item.save(); res.status(201).json({ message: 'Trader saved successfully!', data: item }); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/traders/:id', async (req, res) => {
    try { const updated = await Trader.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ message: 'Trader updated successfully!', data: updated }); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/traders/:id', async (req, res) => {
    try { await Trader.findByIdAndDelete(req.params.id); res.json({ message: 'Trader deleted successfully!' }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ITEM ROUTES ---
router.get('/items', async (req, res) => {
    try { const data = await Item.find(); res.json(data); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/items', async (req, res) => {
    try { const item = new Item(req.body); await item.save(); res.status(201).json({ message: 'Item saved successfully!', data: item }); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/items/:id', async (req, res) => {
    try { const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ message: 'Item updated successfully!', data: updated }); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/items/:id', async (req, res) => {
    try { await Item.findByIdAndDelete(req.params.id); res.json({ message: 'Item deleted successfully!' }); } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;