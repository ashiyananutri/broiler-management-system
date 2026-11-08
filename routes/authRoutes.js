const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get All Users (Smart Dual Format Response for Frontend Compatibility)
router.get(['/', '/users', '/all', '/get-users'], async (req, res) => {
    try {
        const users = await User.find().lean();
        
        // Return both array and object structures so frontend UI never fails
        res.json({
            success: true,
            count: users.length,
            users: users,
            data: users,
            list: users,
            // If frontend parses response directly as an array or uses spread items
            results: users
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: err.message });
    }
});

// Standard Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, username, password, user: legacyUser } = req.body;
        const identifier = email || username || legacyUser;

        if (!identifier || !password) {
            return res.status(400).json({ error: "Please provide credentials" });
        }

        const dbUser = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier },
                { name: identifier }
            ]
        }).lean();

        if (!dbUser) {
            return res.status(401).json({ error: "User not found!" });
        }

        if (password !== dbUser.password) {
            return res.status(401).json({ error: "Invalid password!" });
        }

        res.json({
            message: "Login successful",
            user: {
                id: dbUser._id,
                name: dbUser.name || dbUser.username,
                email: dbUser.email,
                role: dbUser.role || 'user',
                branch: dbUser.branch || 'Main'
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Register / Create User Route
router.post(['/', '/register', '/users'], async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
