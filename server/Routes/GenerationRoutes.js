const express = require('express');
const { generateImage } = require('../Utils/generateImage');
const { generateQuiz } = require('../Utils/generateQuiz');

const router = express.Router();

// Generate image API endpoint
router.post('/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log(prompt, "prompt");
        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }
        const response = await generateImage(prompt);
        if (!response) {
            console.error("Invalid AI response for prompt:", prompt);
            return res.status(500).json({ success: false, message: "Invalid AI response" });
        }
        return res.status(200).json({ success: true, data: response, message: "Image generated successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ success: false, message: "Error occurred while generating image", error: error.message });
    }
});

// Generate quiz API endpoint
router.post('/generate-quiz', async (req, res) => {
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