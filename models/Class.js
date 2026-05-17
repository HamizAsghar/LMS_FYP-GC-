const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    trim: true,
  },
  program: {
    type: String,
    required: true,
    trim: true,
  },
  semester: {
    type: String,
    required: true,
    trim: true,
  },
  sections: [{
    type: String,
    trim: true,
  }],
  subjects: [{
    type: String,
    trim: true,
  }],
}, { timestamps: true });

const Class = mongoose.models.Class || mongoose.model("Class", classSchema);

module.exports = Class;
