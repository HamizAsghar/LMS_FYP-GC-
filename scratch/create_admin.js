const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && !process.env[key]) process.env[key] = val;
    });
}

loadEnvFile(path.join(__dirname, '..', '.env.local'));
loadEnvFile(path.join(__dirname, '..', '.env'));

const User = require('../models/User');

async function createAdmin() {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    
    const existing = await User.findOne({ email: 'admin@eduhub.edu' });
    if (existing) {
        console.log('Admin already exists. Updating password to admin123');
        existing.password = 'admin123';
        await existing.save();
    } else {
        console.log('Creating admin user...');
        await User.create({
            name: 'System Admin',
            email: 'admin@eduhub.edu',
            password: 'admin123',
            role: 'Admin',
            department: 'IT',
            isVerified: true,
            approvalStatus: 'Approved',
            status: 'Active',
        });
        console.log('Admin user created successfully!');
    }
    
    await mongoose.disconnect();
}

createAdmin().catch(console.error);
