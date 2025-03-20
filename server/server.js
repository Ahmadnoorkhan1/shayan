const express = require('express');
const dotenv = require('dotenv');
const { syncDatabase } = require('./Config/db');
const authRoutes = require('./Routes/UserRoutes');
const courseRoutes = require('./Routes/CourseRoutes');
const bookRoutes = require('./Routes/BookRoutes');
const easyCourseRoutes = require('./Routes/EasyCourseRoutes');
const generationRoutes = require('./Routes/GenerationRoutes');
const sharingRoutes = require('./Routes/SharingRoutes');
const answerCheckRoutes = require('./Routes/AnswerCheckRoutes');
const cors = require("cors");
const path = require('path');

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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/course-creator', courseRoutes);
app.use('/api/book-creator', bookRoutes);
app.use('/api/easy-course-creator', easyCourseRoutes);
app.use('/api', generationRoutes);
app.use('/api/shared', sharingRoutes);
app.use('/api', answerCheckRoutes); // This will add the /api/check-answer route

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));