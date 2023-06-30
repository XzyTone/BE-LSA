// controllers/examController.js

const Exam = require('../models/Exam');
const Student = require('../models/Student');

async function startExam(req, res) {
  const { examId } = req.params;
  const { examToken } = req.body;

  try {
    // Mencari ujian berdasarkan ID
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Mencari siswa berdasarkan token dan memasukkan token ke dalam ujian
    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const participant = exam.participants.find((p) => p.student.equals(student._id));
    if (!participant) {
      exam.participants.push({ student: student._id, examToken, answer: [] });
      await exam.save();

      student.exams.push(exam._id); // Add the exam reference to the student's exams array
      await student.save();
    } else {
      participant.examToken = examToken;
      await exam.save();
    }

    res.status(200).json({ message: 'Exam started' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start exam' });
  }
}


async function submitExam(req, res) {
  const { examId } = req.params;
  const { answers } = req.body;

  try {
    // Mencari ujian berdasarkan ID
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Mencari siswa berdasarkan token
    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Memasukkan jawaban siswa ke dalam ujian
    const participantIndex = exam.participants.findIndex((p) => p.student.equals(student._id));
    if (participantIndex === -1) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    exam.participants[participantIndex].answer = answers; // Perbarui properti answer dengan array jawaban siswa

    await exam.save();

    res.status(200).json({ message: 'Exam submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit exam' });
  }
}

 

module.exports = { startExam, submitExam };
