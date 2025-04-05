const express = require('express');
const { generateTitlesHandler, generateFullContent } = require('../Controllers/OnboardingController');

const router = express.Router();

// Route to generate titles as part of onboarding
router.post('/generate-titles', generateTitlesHandler);
router.post('/generate-content', generateFullContent);

// You can add more onboarding-related routes here
// router.post('/profile-setup', profileSetupHandler);
// router.post('/preferences', preferencesHandler);

module.exports = router;