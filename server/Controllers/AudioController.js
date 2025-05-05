const path = require('path');
const fs = require('fs');
const Course = require('../Models/CourseModel');

const getChaptersWithAudioUrls = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { chapters } = req.body; // Expecting chapters to be in the request body
    
    // Input validation
    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'courseId is required' 
      });
    }
    
    if (!Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'chapters must be a non-empty array' 
      });
    }
    let audioUrls = []
    // Generate audio URLs for each chapter
    const chaptersWithAudio = chapters.map((chapter, index) => {
      // Index starts from 1, not 0
      const audioUrl = `https://minilessonsacademy.com/wf-content/audio/${courseId}/chapter${index + 1}.mp3`;
      audioUrls.push(audioUrl)
      return {
        audioUrl
      };
    });

    const course = await Course.findOne(
      { where: { course_id: courseId } }
    );

    course.audios = audioUrls;

    course.save();
    
    // Return response
    return res.status(200).json({
      success: true,
      data: course
    });
    
  } catch (error) {
    console.error('Error generating chapter audio URLs:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};


module.exports = {
  getChaptersWithAudioUrls
};