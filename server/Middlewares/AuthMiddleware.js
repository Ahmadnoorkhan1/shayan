const jwt = require('jsonwebtoken');
const User = require('../Models/UserModels');

exports.authenticateToken = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      
      // Attach user to request
      req.user = {
        userId: user.user_id,
        email: user.email
      };
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
      }
      
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};