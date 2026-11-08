const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get All Users Route (Strictly from Database, no defaults)
router.get(['/', '/users', '/all', '/get-users'], async (req, res) => {
    try {
        const users = await User.find().lean();
        
        // Formatting for dropdowns and admin tables
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
        console.error("Error fetching users:", err);
        res.status(500).json({ error: err.message });
    }
});

// Standard Login Route (Strict database check)
router.post('/login', async (req, res) => {
    try {
        const { email, username, password, user: legacyUser } = req.body;
        const identifier = email || username || legacyUser;

        if (!identifier) {
            return res.status(400).json({ error: "Please provide email or username" });
        }

        const dbUser = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier },
                { name: identifier }
            ]
        }).lean();

        if (!dbUser) {
            return res.status(401).json({ error: "User not found in database!" });
        }

        // Optional password check if password field exists in your schema
        if (password && dbUser.password && password !== dbUser.password) {
            return res.status(401).json({ error: "Invalid password!" });
        }

        res.status(200).json({
            message: "Login successful",
            success: true,
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

// Register / Create User Route (Saves strictly to database)
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
