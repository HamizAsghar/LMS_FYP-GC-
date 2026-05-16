const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["Weekly", "Monthly", "Semester", "Custom"],
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Could be Admin or Instructor
    required: true,
  },
  generatedDate: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Flexible field to store report data
    required: true,
  },
  // Optional: period for the report (e.g., 'Week 1', 'March')
  period: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

module.exports = Report;
