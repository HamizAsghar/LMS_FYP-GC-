const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
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
  enrolledCourses: {
    type: Number,
    default: 0,
  },
  submissions: {
    type: Number,
    default: 0,
  },
  attendance: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  }],
}, { timestamps: true });

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

module.exports = Student;
