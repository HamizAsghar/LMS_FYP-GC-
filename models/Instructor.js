const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  department: {
    type: String,
    trim: true,
  },
  courses: {
    type: Number,
    default: 0,
  },
  students: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: { type: String, trim: true },
  designation: { type: String, trim: true },
  specialization: { type: String, trim: true },
  joinDate: { type: Date, default: Date.now },
  publications: { type: Number, default: 0 },
  qualifications: [{
    degree: String,
    institution: String,
    year: String
  }]
}, { timestamps: true });

const Instructor = mongoose.models.Instructor || mongoose.model("Instructor", instructorSchema);

module.exports = Instructor;
