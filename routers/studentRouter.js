// routers/studentRouter.js

const express = require('express');
const {
  getDashboard,
  getExamData,
  getExamResult
} = require('../controllers/studentController');
const {
  verifyToken,
  authorizeStudent
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/dashboard', verifyToken, authorizeStudent, getDashboard);
router.get('/exams', verifyToken, authorizeStudent, getExamData);
router.get('/exam-results', verifyToken, authorizeStudent, getExamResult);

module.exports = router;
