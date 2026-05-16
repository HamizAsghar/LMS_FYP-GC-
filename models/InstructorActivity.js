const mongoose = require("mongoose");

const instructorActivitySchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model for the instructor
    required: true,
  },
  activityType: {
    type: String,
    enum: [
      "MDB Replies",
      "GDB Marking",
      "Assignment Upload",
      "Assignment Marking",
      "Ticket Handling",
      "Email Responses",
    ],
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Completed", "In Progress", "Pending"],
    default: "Pending",
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

const InstructorActivity = mongoose.models.InstructorActivity || mongoose.model("InstructorActivity", instructorActivitySchema);

module.exports = InstructorActivity;
