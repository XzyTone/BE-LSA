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

module.exports = mongoose.model("Question", questionSchema);
