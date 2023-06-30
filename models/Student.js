// models/Student.js

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  exams: [
    {
      exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
      },
      nilai: {
        type: Number // nilai akhir ujian essay masuk ke sini
      }
    }
  ],
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      default: 'student'
    }
  });
  

module.exports = mongoose.model('Student', studentSchema);
