const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY
});

// Route to check short-answer quiz answers
router.post('/check-answer', async (req, res) => {
    try {
        const { questionId, userAnswer, correctAnswer, type } = req.body;
        
        // Validate required fields
        if (!userAnswer || !correctAnswer) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters"
            });
        }
        
        // Use AI to evaluate the answer
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an educational assessment expert. Evaluate how well a student's answer matches the correct answer. 
                    Return a JSON object with two properties:
                    1. "similarity": a percentage (0-100) indicating how similar the answers are conceptually
                    2. "feedback": constructive feedback for the student on their answer`
                },
                {
                    role: "user",
                    content: `Student's answer: "${userAnswer}"
                    Correct answer: "${correctAnswer}"
                    
                    Evaluate how well the student's answer matches the correct answer conceptually, not just exact wording.`
                }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });
        
        // Extract and parse the AI response
        const aiResponse = JSON.parse(response.choices[0].message.content);
        
        return res.status(200).json({
            success: true,
            data: {
                similarity: aiResponse.similarity,
                feedback: aiResponse.feedback,
                correctAnswer: correctAnswer
            },
            message: "Answer evaluated successfully"
        });
    } catch (error) {
        console.error("Error checking answer:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error evaluating answer",
            error: error.message
        });
    }
});

module.exports = router;