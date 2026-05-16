const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) process.env[key.trim()] = val.trim().replace(/^"|"$/g, '');
  });
}

const Course = require('../models/Course');
const User = require('../models/User');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  const courses = await Course.find({}).populate('instructor', 'name email');
  console.log('Total courses:', courses.length);
  courses.forEach(c => {
    console.log(`Course: ${c.name} (${c.code}), ID: ${c._id}, Instructor: ${c.instructor?.name} (${c.instructor?.email})`);
  });
  
  await mongoose.disconnect();
}

check().catch(console.error);
