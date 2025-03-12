const express = require('express');
const dotenv = require('dotenv');
const { syncDatabase } = require('./Config/db');
const authRoutes = require('./Routes/UserRoutes');
const courseRoutes = require('./Routes/CourseRoutes');
const bookRoutes = require('./Routes/BookRoutes');
const easyCourseRoutes = require('./Routes/EasyCourseRoutes');
const cors = require("cors");
const { generateImage } = require('./Utils/generateImage');
const path = require('path');
const { generateQuiz } = require('./Utils/generateQuiz');
const Course = require('./Models/CourseModel'); // Import Course model

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'public/images')));

syncDatabase();
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to the API. Use /api/auth for authentication endpoints.');
});

app.use('/api/auth', authRoutes);
app.use('/api/course-creator', courseRoutes);
app.use('/api/book-creator', bookRoutes);
app.use('/api/easy-course-creator', easyCourseRoutes);

// Generate image API endpoint
app.post('/api/generate-image', async (req, res) => {
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
app.post('/api/generate-quiz', async (req, res) => {
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

// Share Course/Book API endpoint
app.post('/api/course-creator/shareCourse/:courseId/:courseType', async (req, res) => {
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
        const hostUrl = process.env.HOST_URL  ;
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
app.get('/api/shared/:courseType/:courseId', async (req, res) => {
    try {
        const { courseId, courseType } = req.params;
        
        // Find the shared course
        const course = await Course.findOne({
            where: { 
                course_id: courseId,
                type: courseType === 'book' ? 'book' : 'course',
                is_shared: true
            }
        });
        
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: `Shared ${courseType === 'book' ? 'book' : 'course'} not found or not available.` 
            });
        }
        
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));