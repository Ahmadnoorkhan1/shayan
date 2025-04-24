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
    
    // Generate audio URLs for each chapter
    const chaptersWithAudio = chapters.map((chapterName, index) => {
      // Index starts from 1, not 0
      const audioUrl = `https://minilessonsacademy.com/wf-content/audio/${courseId}/chapter${index + 1}.mp3`;
      
      return {
        chapterName,
        audioUrl
      };
    });
    
    // Return response
    return res.status(200).json({
      success: true,
      data: {
        courseId,
        chapters: chaptersWithAudio
      }
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