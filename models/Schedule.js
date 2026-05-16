const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Could be Instructor or Admin
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: false, // Optional, if schedule is not course-specific
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ["Class", "Meeting", "Office Hours", "Event", "Other"],
    default: "Class",
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
}, { timestamps: true });

const Schedule = mongoose.models.Schedule || mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;
