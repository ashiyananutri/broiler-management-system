const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. User Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Find user by username or email
        const query = email ? { email } : { username: username || req.body.user };
        const user = await User.findOne(query).lean();

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Password verification (supports direct match)
        const isMatch = (password === user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Send back user session/details
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name || user.username,
                role: user.role || 'admin',
                branch: user.branch || 'Main'
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Register / Create User Route
router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Get All Users Route
router.get('/', async (req, res) => {
    try {
        const users = await User.find().lean();
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
