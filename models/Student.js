// models/Student.js

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  // exams: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Exam'
  //   }
  // ],
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
    default: "student",
  },
});

module.exports = mongoose.model("Student", studentSchema);
