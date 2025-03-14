const express = require('express');
const Course = require('../Models/CourseModel');

const router = express.Router();

// Share Course/Book API endpoint
router.post('/:courseId/:courseType', async (req, res) => {
    try {
        const { courseId, courseType } = req.params;
        
        // Validate the course type
        if (courseType !== 'course' && courseType !== 'book') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid course type. Must be 'course' or 'book'." 
            });
        }
        
        // Find the course in the database
        const course = await Course.findOne({
            where: { 
                course_id: courseId,
                type: courseType === 'book' ? 'book' : 'course'
            }
        });
        
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: `${courseType === 'book' ? 'Book' : 'Course'} not found.` 
            });
        }
        
        // Update sharing status if needed
        await Course.update(
            { is_shared: true },
            { where: { course_id: courseId } }
        );
        
        // Generate share URL
        const hostUrl = process.env.HOST_URL;
        const shareUrl = `${hostUrl}/shared/${courseType}/${courseId}`;
        
        return res.status(200).json({
            success: true,
            data: {
                shareUrl,
                courseId,
                courseType,
                courseTitle: course.course_title,
            },
            message: `${courseType === 'book' ? 'Book' : 'Course'} shared successfully.`
        });
        
    } catch (error) {
        console.error("Error sharing content:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Error occurred while sharing content", 
            error: error.message 
        });
    }
});

// Public API to access shared content
router.get('/:courseType/:courseId', async (req, res) => {
    try {
        const { courseId, courseType } = req.params;
        
        // Find the shared course
        const course = await Course.findOne({
            where: { 
                course_id: courseId,
                type: courseType === 'book' ? 'book' : 'course',
                // is_shared: true
            }
        });
        
        // Return the public content
        return res.status(200).json({
            success: true,
            data: {
                courseId: course.course_id,
                courseType: course.type,
                title: course.course_title,
                content: course.content,
                coverImage: course.cover_location,
                quizzes: course.quiz_location
            },
            message: `Shared ${courseType === 'book' ? 'book' : 'course'} fetched successfully.`
        });
        
    } catch (error) {
        console.error("Error fetching shared content:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Error occurred while fetching shared content", 
            error: error.message 
        });
    }
});

module.exports = router;