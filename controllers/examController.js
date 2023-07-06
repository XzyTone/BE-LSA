// controllers/examController.js

const Exam = require("../models/Exam");
const Student = require("../models/Student");

async function startExam(req, res) {
  const { examId } = req.params;
  const { examToken } = req.body;

  try {
    // Mencari ujian berdasarkan ID
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Mencari siswa berdasarkan token dan memasukkan token ke dalam ujian
    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Cek apakah siswa telah memulai atau telah menyelesaikan ujian sebelumnya
    const participant = exam.participants.find(
      (p) => p.studentId === student._id.toString()
    );

    if (participant) {
      return res
        .status(400)
        .json({ message: "You have already started the exam" });
    }

    exam.participants.push({
      studentId: student._id.toString(),
      examToken,
      answer: [],
    });
    await exam.save();

    student.exams.push(exam._id); // Add the exam reference to the student's exams array
    await student.save();

    res.status(200).json({ message: "Exam started" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to start exam" });
  }
}

async function submitExam(req, res) {
  const { examId } = req.params;
  const { answers } = req.body;

  try {
    // Mencari ujian berdasarkan ID
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Mencari siswa berdasarkan token
    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Memastikan siswa telah memulai ujian sebelum mengirimkan jawaban
    const participant = exam.participants.find(
      (p) => p.studentId === student._id.toString()
    );

    if (!participant) {
      return res.status(400).json({ message: "You have not started the exam" });
    }

    // Memastikan siswa belum mengirimkan jawaban sebelumnya
    if (participant.answer.length > 0) {
      return res
        .status(400)
        .json({ message: "You have already submitted the exam" });
    }

    participant.answer = answers; // Perbarui properti answer dengan array jawaban siswa

    await exam.save();

    res.status(200).json({ message: "Exam submitted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to submit exam" });
  }
}

module.exports = { startExam, submitExam };
