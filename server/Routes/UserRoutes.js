const express = require('express');
const { registerUser, loginUser, getProfile } = require('../Controllers/UserController');
const authenticateToken = require('../Middlewares/AuthMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;