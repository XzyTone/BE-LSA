const express = require("express");
const {
  addStudents,
  createExam,
  exportStudentAnswers,
  evaluateExam,
  refreshExamToken, // Add this line
} = require("../controllers/teacherController");

const {
  verifyToken,
  authorizeTeacher,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/add-students", verifyToken, authorizeTeacher, addStudents);

router.post("/exams", verifyToken, authorizeTeacher, createExam);

router.get(
  "/exams/:examId/export-answers/:studentId",
  verifyToken,
  authorizeTeacher,
  exportStudentAnswers
);

router.post(
  "/exams/:examId/evaluate",
  verifyToken,
  authorizeTeacher,
  evaluateExam
);

router.post(
  "/exams/:examId/refresh-token",
  verifyToken,
  authorizeTeacher,
  refreshExamToken
); // Add this line

module.exports = router;
