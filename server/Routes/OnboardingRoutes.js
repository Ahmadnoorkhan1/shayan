const express = require('express');
const { 
    generateTitlesHandler, 
    generateSummaryHandler // Add this new reference
} = require('../Controllers/OnboardingController');

const router = express.Router();

// Route to generate titles as part of onboarding
router.post('/generate-titles', generateTitlesHandler);
// New route for generating summary
router.post('/generate-summary', generateSummaryHandler);

// You can add more onboarding-related routes here
// router.post('/profile-setup', profileSetupHandler);
// router.post('/preferences', preferencesHandler);

module.exports = router;