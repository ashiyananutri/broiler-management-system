const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'broiler_secret_key';

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, branch, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, branch, role });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, branch: user.branch }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, branch: user.branch } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/users-list', async (req, res) => {
    try {
        const users = await User.find({}, 'name branch role email');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { name, branch, role, password } = req.body;
        let updateData = { name, branch, role };
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
