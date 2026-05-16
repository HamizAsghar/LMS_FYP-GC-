const mongoose = require("mongoose");

const studentActivitySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model for the student
    required: true,
  },
  activityType: {
    type: String,
    enum: [
      "Assignment Submission",
      "Attendance",
      "Material Download",
      "Quiz Attempt",
      "Course Enrollment",
    ],
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can be number (for attendance, quiz score) or string (for course name)
  },
  status: {
    type: String,
    enum: ["Completed", "In Progress", "Pending", "Missed"],
    default: "Completed",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  remarks: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const StudentActivity = mongoose.models.StudentActivity || mongoose.model("StudentActivity", studentActivitySchema);

module.exports = StudentActivity;
