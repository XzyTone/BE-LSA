// routers/authRouter.js

const express = require('express');
const { register, login, refresh } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', verifyToken, refresh);

module.exports = router;
