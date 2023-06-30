// routers/examRouter.js

const express = require('express');
const {
  startExam,
  submitExam
} = require('../controllers/examController');
const {
  verifyToken,
  authorizeStudent
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/:examId/start', verifyToken, authorizeStudent, startExam);
router.post('/:examId/submit', verifyToken, authorizeStudent, submitExam);

module.exports = router;
