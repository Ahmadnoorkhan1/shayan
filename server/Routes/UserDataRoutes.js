const express = require('express');
const User = require('../Models/UserModels');
// const { isAuthenticated } = require('../Middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/user-data
 * @desc    Save user preferences from onboarding
 * @access  Private
 */
router.post('/', async (req, res) => {
    try {
        const userId = req.body.userId || req.user.id; // Get user ID from request body or authenticated user
        const preferences = req.body;
        
        // Update user profile with preferences as JSON
        const updatedUser = await User.update({
            preferences: JSON.stringify(preferences),
            onboarding_completed: true
        }, {
            where: { user_id: userId }
        });
        
        if (!updatedUser[0]) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'User preferences saved successfully',
            data: preferences
        });
        
    } catch (error) {
        console.error('Error saving user preferences:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while saving user preferences',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/user-data
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.body.userId;
        
        const user = await User.findByPk(userId, {
            attributes: ['id', 'preferences', 'onboarding_completed']
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Parse JSON preferences or return empty object if null
        const preferences = user.preferences ? JSON.parse(user.preferences) : {};
        
        return res.status(200).json({
            success: true,
            data: preferences,
            onboardingCompleted: user.onboarding_completed || false,
            message: 'User preferences retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error retrieving user preferences:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Server error while retrieving user preferences',
            error: error.message
        });
    }
});

module.exports = router;