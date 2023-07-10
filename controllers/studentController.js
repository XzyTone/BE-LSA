// controllers/studentController.js

const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Student = require("../models/Student");
const { getSubmittedExamsPromise } = require("./utils");

async function getAllStudents(req, res) {
  try {
    const students = await Student.find();

    return res.status(200).json({ message: "Success", data: students });
  } catch (error) {
    res.status(500).json({ message: "Failed to get students" });
  }
}

async function getDashboard(req, res) {
  try {
    // Mendapatkan data siswa berdasarkan token
    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Success", data: student });
  } catch (error) {
    res.status(500).json({ message: "Failed to get dashboard" });
  }
}

async function getExamData(req, res) {
  try {
    // Mendapatkan data ujian siswa berdasarkan token
    const student = await Student.findById(req.userId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const exams = await Exam.find({ studentIds: { $in: student._id } });

    const formattedExams = await Promise.all(
      exams.map(async (exam) => {
        const questions = await Question.find({ _id: { $in: exam.questions } });

        return {
          _id: exam._id,
          subject: exam.subject,
          endTime: exam.endTime,
          duration: exam.duration,
          examToken: exam.examToken,
          participants: exam.participants,
          questions,
          thumbnailPath: exam.thumbnailPath,
        };
      })
    );

    res.status(200).json({ message: "Success", data: formattedExams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getExamResult(req, res) {
  try {
    const student = await Student.findById(req.userId);
    const studentId = student._id.toString();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const exams = await Exam.find({
      studentIds: { $in: studentId },
    });

    // get submitted exams, scored or not
    const submittedExams = exams.map((exam) => {
      const scoredTest = exam.participants.find(
        (participant) => participant.studentId === studentId
      );

      return scoredTest;
    });

    // promise that transform submitted exams to formatted result
    const submittedExamsPromises = await getSubmittedExamsPromise(
      exams,
      submittedExams
    );

    const result = await Promise.all(submittedExamsPromises);

    res
      .status(200)
      .json({ message: "Success", data: result.filter((result) => result) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getAllStudents, getDashboard, getExamData, getExamResult };
