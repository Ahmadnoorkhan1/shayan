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
const uploadRoutes = require('./Routes/UploadRoutes');
const cors = require("cors");
const path = require('path');
const { sequelize } = require('./Config/db');


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
app.use('/api/files', uploadRoutes); // Add routes for Cloudflare R2 file uploads


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Add this to your server.js or a database migration file
// async function fixDatabaseSchema() {
//   try {
//     // Drop the incorrect foreign key constraint
//     await sequelize.query('ALTER TABLE courses DROP FOREIGN KEY courses_ibfk_1');
    
//     // Add new constraint pointing to your real users table
//     await sequelize.query(`
//       ALTER TABLE courses ADD CONSTRAINT courses_creator_fk
//       FOREIGN KEY (creator_id) REFERENCES users(user_id)
//       ON DELETE CASCADE ON UPDATE CASCADE
//     `);
    
//     console.log('Database schema fixed successfully');
//   } catch (error) {
//     console.error('Error fixing database schema:', error);
//   }
// }

// Call this function when your server starts
// fixDatabaseSchema();