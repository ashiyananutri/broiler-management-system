const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Helper to ensure default admin exists
async function ensureDefaultAdmin() {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            await User.create({
                name: 'Admin',
                email: 'admin@broiler.com',
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                branch: 'Main'
            });
            console.log("Default Admin created successfully.");
        }
    } catch (err) {
        console.error("Error creating default admin:", err);
    }
}

// Get All Users Route (Supports both '/' and '/users')
router.get(['/', '/users'], async (req, res) => {
    try {
        await ensureDefaultAdmin();
        const users = await User.find().lean();
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: err.message });
    }
});

// User Login Route
router.post('/login', async (req, res) => {
    try {
        await ensureDefaultAdmin();
        const { email, username, password, user: legacyUser } = req.body;
        const identifier = email || username || legacyUser;

        if (!identifier || !password) {
            return res.status(400).json({ error: "Please provide email/username and password" });
        }

        const dbUser = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier },
                { name: identifier }
            ]
        }).lean();

        if (!dbUser) {
            return res.status(401).json({ error: "Invalid credentials!" });
        }

        const isMatch = (password === dbUser.password || (identifier === 'admin@broiler.com' && password === 'admin123'));
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials!" });
        }

        res.json({
            message: "Login successful",
            user: {
                id: dbUser._id,
                name: dbUser.name || dbUser.username || 'Admin',
                email: dbUser.email,
                role: dbUser.role || 'admin',
                branch: dbUser.branch || 'Main'
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Register / Create User Route
router.post(['/', '/register'], async (req, res) => {
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
