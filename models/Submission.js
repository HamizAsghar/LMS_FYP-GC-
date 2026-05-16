const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming student is a User with role 'Student'
    required: true,
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  submittedDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Submitted", "Graded", "Late", "Pending"], // Added Pending as a possible status
    default: "Submitted",
  },
  marks: {
    type: Number,
    min: 0,
    max: 100, // Assuming marks are out of 100, adjust if needed
    default: null,
  },
  feedback: {
    type: String,
    trim: true,
  },
  file: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

module.exports = Submission;
