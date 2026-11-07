const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, branch } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'supervisor',
            branch: branch || 'Main Branch'
        });

        await user.save();
        res.status(201).json({ message: 'User created successfully!', user });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required!' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password!' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, branch: user.branch }, 
            process.env.JWT_SECRET || 'broiler_secret_key', 
            { expiresIn: '1d' }
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                branch: user.branch 
            } 
        });
    } catch (error) {
        console.error("Login Server Error:", error);
        res.status(500).json({ message: 'Server error during login. Try again.' });
    }
});

// Get All Users List Route
router.get('/users-list', async (req, res) => {
    try {
        const users = await User.find({}, 'name branch role email');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User Route (Admin can update Name, Branch, Role, & Password)
router.put('/users/:id', async (req, res) => {
    try {
        const { name, branch, role, password } = req.body;
        
        let updateData = { name, branch, role };

        // Agar admin ne naya password dala hai toh use encrypt karke update karein
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        res.json({ message: 'User updated successfully!', data: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete User Route
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;