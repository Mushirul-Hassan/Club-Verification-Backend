// scripts/seedAdmin.js
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import 'dotenv/config';

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await Admin.create({
    username: 'superadmin',
    password: 'Admin@123',
    fullName: 'Clubin Admin',
    role: 'ADMIN',
    isActive: true
  });

  console.log('✅ Admin created:', admin.username);
  process.exit(0);
};

seedAdmin();