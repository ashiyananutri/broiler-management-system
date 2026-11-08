const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_CONNECTION_STRING_HERE';
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Routes Import
const authRoutes = require('./routes/authRoutes');
const broilerRoutes = require('./routes/broilerRoutes');

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/users', authRoutes);

app.use('/api/broiler', broilerRoutes);
app.use('/api', broilerRoutes);
app.use('/', broilerRoutes);

// Frontend Static Serving
const frontendPath = path.join(__dirname, 'public');
app.use(express.static(frontendPath));

// Fallback Route for SPA
app.get('*', (req, res) => {
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send('Broiler Management System Backend is Running Successfully!');
    }
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
