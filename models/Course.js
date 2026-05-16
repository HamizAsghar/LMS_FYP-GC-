const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming instructor is a User with role 'Instructor'
    required: true,
  },
  semester: {
    type: String,
    trim: true,
  },
  students: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Active", "Completed", "Archived"],
    default: "Active",
  },
  category: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

module.exports = Course;
