const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. Get All Users strictly from Database
router.get(['/', '/users', '/all', '/get-users'], async (req, res) => {
    try {
        const users = await User.find().lean();
        // Returns exact database records or empty array if none exist
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Standard Login Route
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

// 3. Register / Create User Route (Saves directly to MongoDB Atlas)
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
