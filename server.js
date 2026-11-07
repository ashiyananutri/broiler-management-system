const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// API Routes Link
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/broiler', require('./routes/broilerRoutes'));

// Serve Static Frontend folder (No complex string errors)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});