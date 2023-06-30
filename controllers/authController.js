// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

async function register(req, res) {
  const { name, email, password, role } = req.body;

  try {
    // Membuat hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat user baru sesuai role
    let user;
    if (role === 'student') {
      user = new Student({ name, email, password: hashedPassword });
    } else if (role === 'teacher') {
      user = new Teacher({ name, email, password: hashedPassword });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Menyimpan user ke database
    await user.save();

    // Menghasilkan token
    const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User registered', token });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register user' });
  }
}

async function login(req, res) {
    const { email, password } = req.body;
  
    try {
      // Mencari pengguna berdasarkan email
      let user = await Student.findOne({ email });
      
      // Jika tidak ada siswa dengan email tersebut, coba mencari guru
      if (!user) {
        user = await Teacher.findOne({ email });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Memverifikasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Menghasilkan token
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      res.status(500).json({ message: 'Failed to login' });
    }
  }

module.exports = { register, login };
