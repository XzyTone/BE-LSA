// models/Exam.js

const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
  },
  studentIds: [String], //siswa yang mendapatkan ujian ini
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
      answer: [
        {
          type: String,
        },
      ],
      score: {
        type: Number
      },
    },
  ],
  duration: {
    type: String,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  // refreshTokens: [
  //   {
  //     type: String
  //   }
  // ],
  examToken: {
    type: String,
    required: true,
  },
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;