const express = require('express');
const { 
    generateTitlesHandler, 
    generateSummaryHandler, 
    generateChapterContentHandler
} = require('../Controllers/OnboardingController');
const Course = require('../Models/CourseModel');


const router = express.Router();

router.post('/generate-titles', generateTitlesHandler);
router.post('/generate-summary', generateSummaryHandler);

router.post('/generate-chapter-content', generateChapterContentHandler);

router.post('/addContent/:contentType', async (req, res) => {
    try {
        const { contentType } = req.params;
        const { creator_id, course_title, content, type = contentType } = req.body;
        
        // Validate required fields
        if (!creator_id || !course_title || !content) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: creator_id, course_title, or content"
            });
        }
        
        // Create a new course/book entry
        const newContent = await Course.create({
            creator_id,
            course_title,
            content,
            // Use the contentType from URL parameter if type is not provided in request body
            type: contentType || type
        });
        
        return res.status(201).json({
            success: true,
            message: `${contentType} content added successfully`,
            data: newContent
        });
    } catch (error) {
        console.error("Error adding content:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error occurred while adding content",
            error: error.message
        });
    }
});
// You can add more onboarding-related routes here
// router.post('/profile-setup', profileSetupHandler);
// router.post('/preferences', preferencesHandler);

module.exports = router;