// controllers/teacherController.js

const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Teacher = require("../models/Teacher");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const natural = require("natural");
const _ = require("lodash");
const Student = require("../models/Student");

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
        };
      })
    );

    return res.status(200).json({ data: formattedExams });
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
      // endTime,
      // refreshTokens,
      examToken, // Menyimpan token ujian dalam dokumen ujian
    });

    await exam.save();

    res.status(201).json({ message: "Exam created", data: exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

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

async function evaluateExam(req, res) {
  try {
    const { examId } = req.params;

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
      (participant) => participant.student._id.toString() === req.userId // Assuming req.userId contains the student's ID
    );

    console.log("req.userId:", req.userId);
    console.log("Exam participants:", exam.participants);

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Retrieve the student's answers from the participant object
    const studentAnswers = participant.answer;

    // Calculate similarity scores using Cosine Similarity
    const similarityScores = [];
    participant.answer.forEach((answer, index) => {
      const question = exam.questions[index];
      const score = calculateCosineSimilarity(question.answerKey, answer);
      similarityScores.push({ question, similarity: score });
    });

    // Calculate total score for the student
    const totalScore = _.sumBy(similarityScores, "similarity");

    res.status(200).json({ message: "Success", similarityScores, totalScore });
  } catch (error) {
    res.status(500).json({ message: "Failed to evaluate exam" });
    console.error("Failed to evaluate exam:", error);
  }
}

function calculateCosineSimilarity(text1, text2) {
  const tokenizer = new natural.WordTokenizer();
  const vector1 = tokenizer.tokenize(text1);
  const vector2 = tokenizer.tokenize(text2);

  const tfidf = new natural.TfIdf();
  tfidf.addDocument(vector1.join(" "));
  tfidf.addDocument(vector2.join(" "));

  const vec1 = tfidf.getDocumentVector(0);
  const vec2 = tfidf.getDocumentVector(1);

  const similarity =
    natural.Vector.dot(vec1, vec2) /
    (natural.Vector.magnitude(vec1) * natural.Vector.magnitude(vec2));
  return similarity;
}

// ...

module.exports = {
  getStudents,
  addStudents,
  getExams,
  createExam,
  exportStudentAnswers,
  refreshExamToken,
  evaluateExam,
};
