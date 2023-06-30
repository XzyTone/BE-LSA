// server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRouter = require('./routers/authRouter');
const studentRouter = require('./routers/studentRouter');
const teacherRouter = require('./routers/teacherRouter');
const examRouter = require('./routers/examRouter');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('Failed to connect to MongoDB', error);
  });

app.use('/auth', authRouter);
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);
app.use('/exam', examRouter);
