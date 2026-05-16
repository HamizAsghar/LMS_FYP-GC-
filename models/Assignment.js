const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0,
  },
  uploadedDate: {
    type: Date,
    default: Date.now,
  },
  submissionsCount: {
    type: Number,
    default: 0,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Active", "Completed", "Archived"],
    default: "Active",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileUrl: {
    type: String,
    trim: true,
    default: "",
  },
  instructions: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
