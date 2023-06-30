// controllers/teacherController.js

const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Teacher = require('../models/Teacher');
const PDFDocument = require('pdfkit');
const fs = require('fs');


async function createExam(req, res) {
  const { subject, questions, startTime, endTime, refreshTokens } = req.body;

  try {
    // Mencari guru berdasarkan token
    const teacher = await Teacher.findById(req.userId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Membuat soal-soal ujian
    const questionIds = await Promise.all(
      questions.map(async (q) => {
        const question = new Question({
          exam: null,
          question: q.question,
          answerKey: q.answerKey, // Menyimpan kunci jawaban guru
          score: q.score // Menyimpan guru membuat bobot persoalnya
        });
        await question.save();
        return question._id;
      })
    );


    // Membuat token ujian
    const examToken = generateExamToken(); // Fungsi untuk menghasilkan token ujian unik
    const exam = new Exam({
      subject,
      questions: questionIds,
      startTime,
      endTime,
      refreshTokens,
      examToken // Menyimpan token ujian dalam dokumen ujian
    });

    await exam.save();

    res.status(201).json({ message: 'Exam created', data: exam });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create exam' });
  }
}

function generateExamToken() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
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
      const exam = await Exam.findById(examId).populate({
        path: 'participants.student',
        select: 'name',
      }).populate('questions');
  
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
  
      // Find the participant with the matching student ID
      const participant = exam.participants.find(
        (participant) => participant.student._id.toString() === studentId
      );
  
      if (!participant) {
        return res.status(404).json({ message: 'Participant not found' });
      }
  
      // Create a folder to store the PDF file
      const folderPath = './student_answers';
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
  
      res.status(200).json({ message: 'Success', filePath });
    } catch (error) {
      res.status(500).json({ message: 'Failed to export student answers' });
    }
  }
  
  
    

module.exports = { createExam, exportStudentAnswers };
