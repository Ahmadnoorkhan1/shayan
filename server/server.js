const express = require('express');
const dotenv = require('dotenv');
const { syncDatabase } = require('./Config/db'); // Import correctly
const authRoutes = require('./Routes/UserRoutes');
const courseRoutes = require('./Routes/CourseRoutes');
const bookRoutes = require('./Routes/BookRoutes');
const easyCourseRoutes = require('./Routes/EasyCourseRoutes');
const cors = require("cors");
const { generateImage } = require('./Utils/generateImage');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'public/images')));


syncDatabase(); // Now it will work
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to the API. Use /api/auth for authentication endpoints.');
});

app.use('/api/auth', authRoutes);
app.use('/api/course-creator', courseRoutes);
app.use('/api/book-creator', bookRoutes);
app.use('/api/easy-course-creator', easyCourseRoutes);
// create a route that will use a function from service, the api will receive prompt from user and it will use open-api-key from env and use dalle model to generate an image based on that prompt and return
// the image to the user
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



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));