const express = require('express');
const { generateImage } = require('../Utils/generateImage');
const { generateQuiz } = require('../Utils/generateQuiz');
const { getContentImages, deleteImage } = require('../Utils/fileStorage');

const router = express.Router();

// Generate image API endpoint
router.post('/generate-image', async (req, res) => {
    try {
        const { contentType = 'book',  courseId,prompt } = req.body;

        console.log(req.body, "Request body for image generation");
        
        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }
        
        if (!courseId) {
            return res.status(400).json({ success: false, message: "Content ID is required" });
        }
        
        const response = await generateImage(prompt, {
            contentType,
            contentId: courseId,
            description: prompt
        });
        
        if (!response) {
            console.error("Invalid AI response for prompt:", prompt);
            return res.status(500).json({ success: false, message: "Invalid AI response" });
        }
        
        return res.status(200).json({ 
            success: true, 
            data: response, 
            message: "Image generated and saved successfully" 
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Error occurred while generating image", 
            error: error.message 
        });
    }
});

// Get images for content API endpoint
router.get('/images/:contentType/:contentId', async (req, res) => {
    try {
        const { contentType, contentId } = req.params;
        
        if (!contentId) {
            return res.status(400).json({ success: false, message: "Content ID is required" });
        }
        
        const imagesList = await getContentImages(contentType, contentId);
        
        return res.status(200).json({ 
            success: true, 
            data: imagesList, 
            message: "Images retrieved successfully" 
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Error retrieving images", 
            error: error.message 
        });
    }
});

// Delete image API endpoint
router.delete('/images/:contentType/:contentId/:imageId', async (req, res) => {
    try {
        const { contentType, contentId, imageId } = req.params;
        
        if (!contentId || !imageId) {
            return res.status(400).json({ 
                success: false, 
                message: "Content ID and Image ID are required" 
            });
        }
        
        const success = await deleteImage(contentType, contentId, imageId);
        
        if (!success) {
            return res.status(404).json({ 
                success: false, 
                message: "Image not found or could not be deleted" 
            });
        }
        
        return res.status(200).json({ 
            success: true, 
            message: "Image deleted successfully" 
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Error deleting image", 
            error: error.message 
        });
    }
});

// Generate quiz API endpoint
router.post('/generate-quiz', async (req, res) => {
    // Existing quiz generation code
    try {
        const { chapterContent, quizType, questionCount } = req.body;
        
        if (!chapterContent) {
            return res.status(400).json({ success: false, message: "Chapter content is required" });
        }
        
        const response = await generateQuiz({
            chapterContent,
            quizType: quizType || 'multiple-choice',
            questionCount: questionCount || 5
        });
        
        if (!response) {
            console.error("Invalid AI response for quiz generation");
            return res.status(500).json({ success: false, message: "Failed to generate quiz" });
        }
        
        return res.status(200).json({ 
            success: true, 
            data: response, 
            message: "Quiz generated successfully" 
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Error occurred while generating quiz", 
            error: error.message 
        });
    }
});

module.exports = router;