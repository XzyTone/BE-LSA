const express = require("express");
const {
  getStudents,
  addStudents,
  getExams,
  createExam,
  exportStudentAnswers,
  refreshExamToken, // Add this line
  evaluateAnswers,
} = require("../controllers/teacherController");

const {
  verifyToken,
  authorizeTeacher,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/students", verifyToken, authorizeTeacher, getStudents);
router.post("/students", verifyToken, authorizeTeacher, addStudents);

router.post("/exams", verifyToken, authorizeTeacher, createExam);

router.get("/exams", verifyToken, authorizeTeacher, getExams);

router.get(
  "/exams/:examId/export-answers/:studentId",
  verifyToken,
  authorizeTeacher,
  exportStudentAnswers
);

router.post(
  "/exams/:examId/refresh-token",
  verifyToken,
  authorizeTeacher,
  refreshExamToken
); // Add this line

router.post(
  "/exams/:examId/evaluate/:studentId",
  verifyToken,
  authorizeTeacher,
  evaluateAnswers
);

module.exports = router;
