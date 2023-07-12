const express = require("express");
const Exam = require("../models/Exam");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Question = require("../models/Question");

const router = express.Router();

router.delete("/wipe", async (req, res) => {
  try {
    const deletePromises = [
      Exam.deleteMany(),
      Student.deleteMany(),
      Teacher.deleteMany(),
      Question.deleteMany(),
    ];

    await Promise.all(deletePromises);

    return res.status(200).json({ message: "Data wiped!" });
  } catch (error) {
    console.log("error wipe data: ", error.message);

    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
