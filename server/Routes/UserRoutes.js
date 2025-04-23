const express = require('express');
const { registerUser, loginUser, getProfile } = require('../Controllers/UserController');
const {authenticateToken} = require('../Middlewares/AuthMiddleware');
const { verifyAccessToken, generateAccessToken } = require('../Controllers/authController'); // Import the verifyAccessToken function

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, getProfile);

// Route to generate access token (protected, requires authentication)
router.post('/generate-access-token',  generateAccessToken);

// Route to verify access token (public endpoint for the second application)
router.post('/verify-access-token', verifyAccessToken);

module.exports = router;