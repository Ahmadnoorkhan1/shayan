const express = require('express');
const { createCourseTitle, createCourseSummary, createCompleteCourse, getCourseChapter, addCourse, getCourses, getCourseById, updateCourse, deleteCourse, convertBlobToChapters, convertExternalQuiz } = require('../Controllers/CourseController');
const { authenticateToken } = require('../Middlewares/AuthMiddleware');
// const {  getChaptersWithAudioUrls } = require('../Controllers/AudioController');
const { getChaptersWithAudioUrls } = require('../Controllers/AudioController');
const router = express.Router();
router.post('/audio/:courseId', getChaptersWithAudioUrls);

router.post('/step-1', createCourseTitle);
router.post('/step-3', createCourseSummary);
router.post('/step-5', createCompleteCourse);
router.post('/getCourseChapter', getCourseChapter);
router.post('/addCourse/:type', addCourse);
router.get('/getCourses/:type', authenticateToken, getCourses);
router.get('/getCourseById/:id/:type', getCourseById);

router.post('/updateCourse/:id/:type', updateCourse);
router.post('/deleteCourse/:id/:type', deleteCourse);
router.post('/convert-blob-to-chapters', convertBlobToChapters);
router.post('/convert-external-quiz', convertExternalQuiz);

module.exports = router;