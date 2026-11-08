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

// Master Routes
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

// Users & Supervisors Route for Form Dropdowns
router.get(['/users', '/api/users', '/supervisors', '/api/supervisors'], async (req, res) => {
    try { 
        const users = await User.find().lean();
        const formattedUsers = users.map(u => ({
            _id: u._id,
            id: u._id,
            name: u.name || u.username || 'User',
            username: u.username || u.name || '',
            role: u.role || 'user',
            branch: u.branch || 'Main'
        }));
        res.json(formattedUsers); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

router.post(['/users', '/api/users'], async (req, res) => {
    try { 
        const item = new User(req.body); 
        res.status(201).json(await item.save()); 
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

router.get('/farmers', async (req, res) => {
    try { res.json(await Farmer.find().lean()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/farmers', async (req, res) => {
    try { const item = new Farmer(req.body); res.status(201).json(await item.save()); } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
