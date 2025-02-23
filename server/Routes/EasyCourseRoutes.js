const express = require('express');
const { createCourseTitle, createCompleteCourse, getCourseChapter } = require('../Controllers/EasyCourseController');

const router = express.Router();

router.post('/step-1', createCourseTitle);
router.post('/step-5', createCompleteCourse);
router.post('/getCourseChapter', getCourseChapter);

module.exports = router;