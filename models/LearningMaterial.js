const mongoose = require("mongoose");

const learningMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["PDF", "Video", "Slides", "Document", "Lecture", "Notes"],
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming uploadedBy is a User (Instructor or Admin)
    required: true,
  },
  uploadedDate: {
    type: Date,
    default: Date.now,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  size: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String,
    trim: true,
  } // Assuming a URL for the material file
}, { timestamps: true });

const LearningMaterial = mongoose.models.LearningMaterial || mongoose.model("LearningMaterial", learningMaterialSchema);

module.exports = LearningMaterial;
