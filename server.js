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

// API Route Mounting (Supporting all path variations)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/users', authRoutes);

app.use('/api', broilerRoutes);
app.use('/', broilerRoutes);

// ==========================================
// FRONTEND STATIC SERVING (Fixes the root text message issue)
// ==========================================
// Yeh aapke frontend files ko serve karega ('public' folder ya 'dist' folder se)
const frontendPath = path.join(__dirname, 'public'); // Agar aapka folder 'dist' ya kuch aur hai toh yahan change kar sakte hain
app.use(express.static(frontendPath));

// Fallback Route for Single Page Applications (SPA)
app.get('*', (req, res) => {
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend index.html not found in public folder!');
    }
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
