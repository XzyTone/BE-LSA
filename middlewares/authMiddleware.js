// middlewares/authMiddleware.js

const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token not provided" });
  }

  const token = authHeader.substring(7); // Menghapus prefiks "Bearer " dari token

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  });
}

function authorizeStudent(req, res, next) {
  if (req.role !== "student") {
    return res.status(403).json({ message: "Access forbidden" });
  }
  next();
}

function authorizeTeacher(req, res, next) {
  if (req.role !== "teacher") {
    return res.status(403).json({ message: "Access forbidden" });
  }
  next();
}

module.exports = { verifyToken, authorizeStudent, authorizeTeacher };
