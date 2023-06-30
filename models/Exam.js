// models/Exam.js

const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }
  ],
  participants: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      answer: [String] // Jawaban siswa
    }
  ],
  examToken:String,
  startTime: Date,
  endTime: Date,
  refreshTokens: Boolean,
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }
});

module.exports = mongoose.model('Exam', examSchema);

