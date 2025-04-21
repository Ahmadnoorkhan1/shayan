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
const onboardingRoutes = require('./Routes/OnboardingRoutes');
const audioRoutes = require('./Routes/AudioRoutes'); 
const userDataRoutes = require('./Routes/UserDataRoutes');
const cors = require("cors");
const path = require('path');


dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors({
    origin:  'http://localhost:5173'|| 'http"://localhost:4173',
    credentials: true,
}));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));
syncDatabase();
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to the API. Use /api/auth for authentication endpoints.');
});

// Mount routes
app.use('/api/course-creator', courseRoutes);
app.use('/api/book-creator', bookRoutes);
app.use('/api/easy-course-creator', easyCourseRoutes);
app.use('/api', generationRoutes);
app.use('/api/shared', sharingRoutes);
app.use('/api', answerCheckRoutes); // This will add the /api/check-answer route
app.use('/api/auth', authRoutes);
app.use('/api/onboard', onboardingRoutes); // New route for onboarding process
app.use('/api/audio', audioRoutes);
app.use('/api/user-data', userDataRoutes); // Add this line


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));