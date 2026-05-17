const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    enum: ["Submitted", "Graded", "Late", "Pending"],
    default: "Submitted",
  },
  marks: {
    type: Number,
    min: 0,
    max: 100,
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
  // References the AssignedClass this submission belongs to
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssignedClass",
  },
}, { timestamps: true });

const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

module.exports = Submission;
