// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

async function register(req, res) {
  const { name, email, password, role } = req.body;

  try {
    // Check if email already exists
    const existingUser = await Student.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Membuat hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat user baru sesuai role
    let user;
    if (role === "student") {
      user = new Student({ name, email, password: hashedPassword });
    } else if (role === "teacher") {
      user = new Teacher({ name, email, password: hashedPassword });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Menyimpan user ke database
    await user.save();

    // Menghasilkan token
    const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered", token });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    let user;
    // Mencari pengguna berdasarkan email
    const studentPromise = Student.findOne({ email: email });
    const teacherPromise = Teacher.findOne({ email: email });

    const [student, teacher] = await Promise.all([
      studentPromise,
      teacherPromise,
    ]);

    // Jika tidak ada siswa atau guru
    if (!student && !teacher) {
      return res.status(404).json({ message: "User not found" });
    }

    user = student || teacher;

    // Memverifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Menghasilkan token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login" });
  }
}

async function refresh(req, res) {
  try {
    // Find the user based on the userId in the request
    let user;
    if (req.role === "student") {
      user = await Student.findById(req.userId);
    } else if (req.role === "teacher") {
      user = await Teacher.findById(req.userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new token with a longer duration
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Token refreshed", token, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to refresh token" });
  }
}

module.exports = { register, login, refresh };
