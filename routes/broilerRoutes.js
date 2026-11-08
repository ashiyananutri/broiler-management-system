const { authorizeRoles, restrictToBranch } = require('../middleware/authMiddleware');

// Sirf Admin hi Edit ya Delete kar sakta hai
router.delete('/farmers/:id', authorizeRoles('admin'), async (req, res) => {
    // Delete logic here
});

// Manager sirf apne branch ka data dekhega, Lifter sirf sale entry karega
router.get('/farmers', restrictToBranch, async (req, res) => {
    try {
        const filter = req.query.branch ? { branch: req.query.branch } : {};
        const farmers = await Farmer.find(filter).lean();
        res.json(farmers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lifter & Sales Man restricted to Transactions/Sales
router.post('/transactions', authorizeRoles('admin', 'lifter', 'salesman', 'accountant'), async (req, res) => {
    try {
        const item = new Transaction(req.body);
        res.status(201).json(await item.save());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
