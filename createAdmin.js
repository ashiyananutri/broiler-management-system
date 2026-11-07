const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // 1. MongoDB Atlas se connect karein
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database Connected Successfully!');

    // 2. Check karein ki pehle se admin hai ya nahi
    const existingUser = await User.findOne({ email: 'admin@broiler.com' });
    if (existingUser) {
      console.log('Admin user already exists!');
      process.exit();
    }

    // 3. Password ko hash karein
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 4. Naya admin user save karein
    const newAdmin = new User({
      name: 'Rishu Raj',
      email: 'admin@broiler.com',
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    console.log('✅ Admin User Created Successfully!');
    console.log('Email: admin@broiler.com');
    console.log('Password: password123');
    
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();