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
    type: Number,
    required: true
  }
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
