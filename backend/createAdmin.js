// createAdmin.js  — run with: node createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const existing = await User.findOne({ email: 'admin@yourdomain.com' });
  if (existing) {
    console.log('Admin already exists:', existing.email, '| isActive:', existing.isActive);
    process.exit();
  }

  await User.create({
    name: 'Admin',
    email: 'admin@email.com',   // change this
    password: '777777',      // change this
    role: 'admin',
    isActive: true
  });

  console.log('✅ Admin created successfully');
  process.exit();
}).catch(err => { console.error(err); process.exit(1); });