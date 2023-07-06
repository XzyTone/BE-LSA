// models/Exam.js

const mongoose = require("mongoose");

// const examSchema = new mongoose.Schema({
//   subject: {
//     type: String,
//     required: true
//   },
//   questions: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Question'
//     }
//   ],
//   participants: [
//     {
//       student: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Student'
//       },
//       answer: [String] // Perbarui properti answer menjadi array
//     }
//   ],
//   examToken:String,
//   startTime: Date,
//   endTime: Date,
//   refreshTokens: Boolean
// });

// module.exports = mongoose.model('Exam', examSchema);

const mongoose = require('mongoose');

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
          type: String
        }
      ]
    }
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