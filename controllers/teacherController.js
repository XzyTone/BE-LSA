// controllers/teacherController.js

const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Teacher = require('../models/Teacher');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const natural = require('natural');
const _ = require('lodash');
const Student = require('../models/Student');
const cosineSimilarity = require('compute-cosine-similarity');

function generateExamToken() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  const tokenLength = 8;

  for (let i = 0; i < tokenLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }

  return token;
}

async function evaluateAnswers(req, res) {
  const { examId, studentId } = req.params;

  try {
    // Retrieve the exam data by ID
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Find the participant by studentId
    const participant = exam.participants.find(
      (p) => p.studentId === studentId
    );

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Retrieve the answer key for the exam
    const answerKey = await Promise.all(
      exam.questions.map(async (questionId) => {
        const question = await Question.findById(questionId);
        return [question.answerKey]; // Wrap the answer key in an array
      })
    );

    // Additional debugging information to check values
    console.log("Answer Key:", answerKey);
    console.log("Participant Answers:", participant.answer);

    // Check if answerKey and participant.answer are arrays of the same length
    if (
      !Array.isArray(answerKey) ||
      !Array.isArray(participant.answer) ||
      answerKey.length !== participant.answer.length
    ) {
      return res.status(400).json({ message: "Invalid answer data" });
    }

    // Calculate the score for each answer using Cosine Similarity
    const scores = participant.answer.map((answer, index) => {
      const score = cosineSimilarity(answerKey[index], [answer]); // Wrap the participant's answer in an array
      return score * exam.questions[index].score;
    });


    console.log("Scores:", scores);
    console.log("type score",typeof score);

    // Calculate the final score by summing all the scores
    const finalScore = scores.reduce((total, score) => total + score, 0);

    // Update the participant's score in the exam
    participant.score = finalScore;

    // Save the updated exam data
    await exam.save();

    res.status(200).json({ message: "Answers evaluated", score: finalScore });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to evaluate answers" });
  }
}


async function addStudents(req, res) {
  const { studentIds } = req.body;

  try {
    const teacher = await Teacher.findById(req.userId);

    await Teacher.updateOne(
      { _id: teacher._id },
      { $push: { students: studentIds } }
    );

    return res.status(200).json({ message: "students added" });
  } catch (error) {
    return res.status(500).json({ message: "Error add students" });
  }
}

async function getStudents(req, res) {
  try {
    const teacher = await Teacher.findById(req.userId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const students = await Student.find({ _id: teacher.students });

    const formattedStudents = students.map((student) => {
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
      };
    });

    return res.status(200).json({ data: formattedStudents });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get Exams" });
  }
}

async function getExams(req, res) {
  try {
    const teacher = await Teacher.findById(req.userId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const exams = await Exam.find({ teacherId: teacher._id });

    return res.status(200).json({ data: exams });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get Exams" });
  }
}

async function createExam(req, res) {
  const { subject, questions, duration, endTime, refreshTokens } = req.body;

  try {
    // Mencari guru berdasarkan token
    const teacher = await Teacher.findById(req.userId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Membuat soal-soal ujian
    const questionIds = await Promise.all(
      questions.map(async (q) => {
        const question = new Question({
          question: q.question,
          answerKey: q.answerKey, // Menyimpan kunci jawaban guru
          score: q.score, // Menyimpan guru membuat bobot persoalnya
        });
        await question.save();

        return question._id;
      })
    );

    // Membuat token ujian
    const examToken = generateExamToken(); // Fungsi untuk menghasilkan token ujian unik
    const exam = new Exam({
      teacherId: teacher._id,
      studentIds: teacher.students,
      subject,
      questions: questionIds,
      duration,
      endTime,
      refreshTokens,
      examToken, // Menyimpan token ujian dalam dokumen ujian
    });

    await exam.save();

    res.status(201).json({ message: "Exam created", data: exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function exportStudentAnswers(req, res) {
  try {
    const { examId, studentId } = req.params;

    // Retrieve the exam data by ID, populating both 'participants.student' and 'questions'
    const exam = await Exam.findById(examId)
      .populate({
        path: "participants.student",
        select: "name",
      })
      .populate("questions");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Find the participant with the matching student ID
    const participant = exam.participants.find(
      (participant) => participant.student._id.toString() === studentId
    );

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Create a folder to store the PDF file
    const folderPath = "./student_answers";
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const studentName = participant.student.name;
    const fileName = `${studentName}_answers.pdf`;
    const filePath = `${folderPath}/${fileName}`;

    // Create a new PDF document using pdfkit
    const doc = new PDFDocument();

    // Fill the PDF content with the student's questions and answers
    doc.text(`Student: ${studentName}`);
    doc.moveDown();

    participant.answer.forEach((answer, index) => {
      const question = exam.questions[index];
      doc.text(`Question ${index + 1}: ${question.question}`);
      doc.moveDown();
      doc.text(`Answer ${index + 1}: ${answer}`);
      doc.moveDown();
    });

    // Save the PDF file to the file system
    doc.pipe(fs.createWriteStream(filePath));
    doc.end();

    res.status(200).json({ message: "Success", filePath });
  } catch (error) {
    res.status(500).json({ message: "Failed to export student answers" });
  }
}

async function refreshExamToken(req, res) {
  try {
    const { examId } = req.params;

    // Retrieve the exam data by ID
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Generate a new exam token
    const newExamToken = generateExamToken();

    // Update the exam token and refresh tokens in the database
    exam.examToken = newExamToken;
    exam.refreshTokens.push(newExamToken);
    await exam.save();

    res
      .status(200)
      .json({ message: "Exam token refreshed", examToken: newExamToken });
  } catch (error) {
    res.status(500).json({ message: "Failed to refresh exam token" });
  }
}

module.exports = {
  getStudents,
  addStudents,
  getExams,
  createExam,
  exportStudentAnswers,
  refreshExamToken,
  evaluateAnswers
};