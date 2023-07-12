// models/Exam.js

const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
  },
  studentIds: [String], // siswa yang mendapatkan ujian ini
  subject: {
    type: String,
    required: true,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  participants: [
    {
      studentId: String,
      examToken: {
        type: String,
        required: true,
      },
      answers: [
        {
          questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
          },
          answer: {
            type: String,
          },
        },
      ],
      cosineScore: {
        type: Number,
      },
      diceScore: {
        type: Number,
      },
    },
  ],
  duration: {
    type: String,
    required: true,
  },
  thumbnailPath: {
    type: String,
    required: true,
  },
  examToken: {
    type: String,
    required: true,
  },
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
