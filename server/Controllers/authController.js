const jwt = require('jsonwebtoken');
const User = require('../Models/UserModels');

exports.generateAccessToken = async (req, res) => {
  console.log('Generating access token...');
  try {
    const { userId } = req.body;
    
    // Verify user exists in database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Create payload with necessary user data
    const payload = {
      userId: user.user_id,
      email: user.email,
      timestamp: new Date().getTime()
    };
    
    // Generate token with expiration (e.g., 15 minutes)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Return token in response
    return res.status(200).json({
      success: true,
      accessToken: token,
      redirectUrl: `${process.env.HOST_URL}?token=${token}`
    });
  } catch (error) {
    console.error('Error generating access token:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate access token' });
  }
};

exports.verifyAccessToken = async (req, res) => {
  console.log('Verifying access token...');
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }
    
    // Verify token validity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Get fresh user data from database for security
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Return user data AND token for client-side storage
    return res.status(200).json({
      success: true,
      userData: {
        id: user.user_id,
        email: user.email,
        onBoardingCompleted: user.onboarding_completed,
      },
      token: token // Return the token back to the client
    });
  } catch (error) {
    // Handle expired or invalid tokens
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    console.error('Error verifying access token:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify access token' });
  }
};