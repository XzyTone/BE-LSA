// models/Teacher.js

const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "teacher",
  },
  students: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Teacher", teacherSchema);
