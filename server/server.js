const express = require('express');
const dotenv = require('dotenv');
const { syncDatabase } = require('./Config/db'); // Import correctly
const authRoutes = require('./Routes/UserRoutes');
const courseRoutes = require('./Routes/CourseRoutes');
const bookRoutes = require('./Routes/BookRoutes');
const easyCourseRoutes = require('./Routes/EasyCourseRoutes');
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

syncDatabase(); // Now it will work
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to the API. Use /api/auth for authentication endpoints.');
});

app.use('/api/auth', authRoutes);
app.use('/api/course-creator', courseRoutes);
app.use('/api/book-creator', bookRoutes);
app.use('/api/easy-course-creator', easyCourseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));