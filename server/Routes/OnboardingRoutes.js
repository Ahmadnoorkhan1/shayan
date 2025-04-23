const express = require('express');
const { 
    generateTitlesHandler, 
    generateSummaryHandler, 
    generateChapterContentHandler,
    addContentHandler
} = require('../Controllers/OnboardingController');
const {authenticateToken} = require('../Middlewares/AuthMiddleware');



const router = express.Router();

router.post('/generate-titles', authenticateToken, generateTitlesHandler);
router.post('/generate-summary',authenticateToken, generateSummaryHandler);

router.post('/generate-chapter-content',authenticateToken, generateChapterContentHandler);

router.post('/addContent/:contentType',authenticateToken, addContentHandler);


module.exports = router;