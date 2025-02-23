const User = require('../Models/UserModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User?.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered. Please log in or use a different email.',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User?.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: user?.user_id, email: user?.email },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error occurred while registering user',
      error: err.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await User?.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User not found.',
        });
      }
  
      // Check password match
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Password is incorrect.',
        });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { token, user: { id: user.user_id, email: user.email } },
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Error occurred during login',
        error: err.message,
      });
    }
  };

  // Get Profile
const getProfile = async (req, res) => {
    try {
      // Fetch user details excluding password
      const user = await User?.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }, // Exclude password from the response
      });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'User profile fetched successfully',
        data: user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Error occurred while fetching user profile',
        error: err.message,
      });
    }
  };


  module.exports ={ registerUser, loginUser, getProfile}