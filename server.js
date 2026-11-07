const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files
app.use(express.static('public'));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/broiler-db')
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.log('DB Connection Error:', err));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const broilerRoutes = require('./routes/broilerRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/broiler', broilerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
