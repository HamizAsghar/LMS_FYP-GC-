// models/Material.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for learning materials uploaded by instructors
const materialSchema = new Schema({
  title: { type: String, required: true, trim: true },
  course: { type: Schema.Types.ObjectId, ref: 'AssignedClass', required: true }, // reference to AssignedClass model
  type: { type: String, enum: ['PDF', 'Video', 'Presentation', 'Other'], required: true },
  size: { type: String }, // human readable size (e.g., "2.5 MB")
  uploadedAt: { type: Date, default: Date.now },
  fileUrl: { type: String }, // URL in storage bucket
  description: { type: String },
  // stats: downloads for PDFs, views for videos, etc.
  stats: { type: Number, default: 0 },
  // Owner reference for authentication/authorization
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.models.Material || mongoose.model('Material', materialSchema);
