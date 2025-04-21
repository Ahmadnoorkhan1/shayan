const { convertBlobToStructuredContentWithAI } = require('../Utils/openaiContentConverter');
require('dotenv').config(); // Load environment variables

// Set the course ID to test
const COURSE_ID_TO_TEST = 1005;

async function runTest() {
  console.log('Starting AI-powered content conversion test');
  console.log(`Testing with course ID: ${COURSE_ID_TO_TEST}`);
  
  try {
    const result = await convertBlobToStructuredContentWithAI(COURSE_ID_TO_TEST);
    
    if (result.success) {
      console.log('✅ AI Conversion successful!');
      console.log(`Converted ${result.chaptersConverted} chapters for "${result.course.title}"`);
    } else {
      console.error('❌ AI Conversion failed:', result.message);
    }
  } catch (error) {
    console.error('Test failed with unexpected error:', error);
  }
}

// Run the test
runTest();