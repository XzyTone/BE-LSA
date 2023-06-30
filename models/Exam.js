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
      answer: [String] // Perbarui properti answer menjadi array
    }
  ],
  examToken:String,
  startTime: Date,
  endTime: Date,
  refreshTokens: Boolean
});

module.exports = mongoose.model('Exam', examSchema);
