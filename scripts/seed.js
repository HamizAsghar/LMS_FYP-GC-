/**
 * Seed database with demo admin, instructor, student, courses, and sample data.
 * Run: node scripts/seed.js
 * Requires MONGODB_URI in .env.local or environment.
 */

const path = require('path');
const fs = require('fs');

// Load .env.local if present
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

const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const InstructorActivity = require('../models/InstructorActivity');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in .env.local');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Instructor.deleteMany({}),
    Course.deleteMany({}),
    Assignment.deleteMany({}),
    InstructorActivity.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@eduhub.edu',
    password: 'admin123',
    role: 'Admin',
    department: 'IT',
    isVerified: true,
    approvalStatus: 'Approved',
    status: 'Active',
  });

  const instructor = await User.create({
    name: 'Dr. Sarah Ahmed',
    email: 'instructor@eduhub.edu',
    password: 'instructor123',
    role: 'Instructor',
    department: 'Computer Science',
    isVerified: true,
    approvalStatus: 'Approved',
    status: 'Active',
  });

  const student = await User.create({
    name: 'Ali Khan',
    email: 'student@eduhub.edu',
    password: 'student123',
    role: 'Student',
    department: 'Computer Science',
    isVerified: true,
    approvalStatus: 'Approved',
    status: 'Active',
  });

  await Instructor.create({
    userId: instructor._id,
    department: 'Computer Science',
    rating: 4.8,
    courses: 1,
    students: 1,
  });

  const course = await Course.create({
    name: 'Database Systems',
    code: 'CS301',
    instructor: instructor._id,
    semester: 'Fall 2026',
    students: 1,
    status: 'Active',
  });

  await Student.create({
    userId: student._id,
    department: 'Computer Science',
    courses: [course._id],
    attendance: 92,
    enrolledCourses: 1,
  });

  await Assignment.create({
    title: 'ER Diagram Assignment',
    subject: 'Database Design',
    description: 'Design ER diagram for university management system',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalMarks: 100,
    course: course._id,
    instructor: instructor._id,
    totalStudents: 1,
  });

  await InstructorActivity.create({
    instructor: instructor._id,
    activityType: 'MDB Replies',
    count: 15,
    status: 'Completed',
    remarks: 'Weekly MDB activity',
  });

  console.log('\nSeed complete!\n');
  console.log('Admin:      admin@eduhub.edu / admin123');
  console.log('Instructor: instructor@eduhub.edu / instructor123');
  console.log('Student:    student@eduhub.edu / student123');
  console.log(`\nAdmin ID: ${admin._id}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
