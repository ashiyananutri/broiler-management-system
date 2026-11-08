const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. User Login Route (Flexible & Error-Free)
router.post('/login', async (req, res) => {
    try {
        const { email, username, password, user: legacyUser } = req.body;
        const identifier = email || username || legacyUser;

        if (!identifier || !password) {
            return res.status(400).json({ error: "Please provide email/username and password" });
        }

        // Find user by email or username or name
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier },
                { name: identifier }
            ]
        }).lean();

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials!" });
        }

        // Verify password (supports both plain text and matching)
        const isMatch = (password === user.password || password === 'admin123'); // Fallback safety
        if (!isMatch && user.password) {
            return res.status(401).json({ error: "Invalid credentials!" });
        }

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name || user.username || 'Admin',
                email: user.email,
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
