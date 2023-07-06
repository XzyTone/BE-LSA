// models/Question.js

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
  },
  question: String,
  answerKey: {
    type: String, // Kunci Jwaban Guru Untuk Mencocokan ke Siswa
  },
  score: {
    type: Number,
    required: true,
  },
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
