// controllers/studentController.js

const Exam = require('../models/Exam');
const Student = require('../models/Student');

async function getDashboard(req, res) {
  try {
    // Mendapatkan data siswa berdasarkan token
    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Success', data: student });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get dashboard' });
  }
}

async function getExamData(req, res) {
  try {
    // Mendapatkan data ujian siswa berdasarkan token
    const student = await Student.findById(req.userId).populate({
      path: 'exams',
      populate: {
        path: 'questions',
        select: '-exam'
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Success', data: student.exams });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get exam data' });
  }
}


async function getExamResult(req, res) {
  try {
    // Mendapatkan hasil ujian siswa berdasarkan token
    const student = await Student.findById(req.userId).populate({
      path: 'exams',
      populate: { path: 'exams.questions',select: '-exam' }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const examResults = student.exams.map((exam) => {
      const result = {
        subject: exam.subject,
        score: 0,
        totalScore: 0
      };

      exam.questions.forEach((question) => {
        if (question.answer === question.userAnswer) {
          result.score++;
        }
        result.totalScore++;
      });

      return result;
    });

    res.status(200).json({ message: 'Success', data: examResults });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get exam result' });
  }
}

module.exports = { getDashboard, getExamData, getExamResult };
