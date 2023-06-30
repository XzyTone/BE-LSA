// routers/teacherRouter.js
const express = require('express');
const {
  createExam,
  exportStudentAnswers,
  evaluateExam
} = require('../controllers/teacherController');
const {
  verifyToken,
  authorizeTeacher
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/exams', verifyToken, authorizeTeacher, createExam);
router.get('/exams/:examId/export-answers/:studentId', verifyToken, authorizeTeacher, exportStudentAnswers);
router.post('/exams/:examId/evaluate', verifyToken, authorizeTeacher, evaluateExam); // Tambahkan route untuk evaluasi ujian

module.exports = router;
