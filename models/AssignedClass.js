const mongoose = require("mongoose");

const assignedClassSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  section: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  credentials: {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    }
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
}, { timestamps: true });

const AssignedClass = mongoose.models.AssignedClass || mongoose.model("AssignedClass", assignedClassSchema);

module.exports = AssignedClass;
