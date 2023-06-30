// models/Question.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam'
  },
  question: {
    type: String,
    required: true
  },
  answerKey: {
    type: String,
    required: true
  },
  score: {
    type: Number, // bobot per soal
    required: true
  }
});

module.exports = mongoose.model('Question', questionSchema);

