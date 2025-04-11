const express = require('express');
const { generateAudio, generateChapterAudio } = require('../Utils/generateAudio');
const Course = require('../Models/CourseModel');
const path = require('path');
const fs = require('fs-extra');

const router = express.Router();

// Generate audio for a book or course
router.post('/generate/:contentId/:contentType', async (req, res) => {
    try {
        const { contentId, contentType } = req.params;
        const { voice } = req.body;
        
        // Validate the content type
        if (contentType !== 'course' && contentType !== 'book') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid content type. Must be 'course' or 'book'." 
            });
        }
        
        // Find the content in the database
        const content = await Course.findOne({
            where: { 
                course_id: contentId,
                type: contentType
            }
        });
        
        if (!content) {
            return res.status(404).json({ 
                success: false, 
                message: `${contentType === 'book' ? 'Book' : 'Course'} not found.` 
            });
        }
        
        // Generate audio
        const audioPath = await generateAudio({
            title: content.course_title,
            content: content.content,
            voice: voice || 'echo' // default to echo voice if not specified
        });
        
        if (!audioPath) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to generate audio" 
            });
        }
        
        // Update the content record with audio location
        await Course.update(
            { audio_location: audioPath },
            { where: { course_id: contentId } }
        );
        
        // Return success response with audio path
        return res.status(200).json({
            success: true,
            data: {
                audioPath,
                contentTitle: content.course_title
            },
            message: `Audio generated successfully for ${contentType === 'book' ? 'book' : 'course'}`
        });
        
    } catch (error) {
        console.error("Error generating audio:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Error occurred while generating audio", 
            error: error.message 
        });
    }
});

// Generate audio for a specific chapter
router.post('/generate-chapter/:id/:contentType', async (req, res) => {
    try {
        const { id, contentType } = req.params;
        const { chapterIndex, chapterContent, voice, timeout = 60000 } = req.body;
        
        // Validate required fields
        if (!chapterContent || chapterIndex === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required parameters: chapterContent and chapterIndex" 
            });
        }
        
        // Validate the content type
        if (contentType !== 'course' && contentType !== 'book') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid content type. Must be 'course' or 'book'." 
            });
        }
        
        // Generate audio with timeout protection
        const audioGeneration = generateChapterAudio({
            chapterContent,
            chapterIndex,
            voice,
            type: contentType,
            id
        });
        
        const audioTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Audio generation timed out")), parseInt(timeout) || 60000)
        );
        
        const audioPath = await Promise.race([audioGeneration, audioTimeout]);
        
        if (!audioPath) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to generate chapter audio" 
            });
        }
        
        // Return success response with audio path
        return res.status(200).json({
            success: true,
            data: {
                audioPath,
                chapterIndex,
                contentType,
                contentId: id
            },
            message: `Chapter ${chapterIndex} audio generated successfully`
        });
        
    } catch (error) {
        console.error("Error generating chapter audio:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Error occurred while generating chapter audio", 
            error: error.message 
        });
    }
});

// Get audio status and path for a content
router.get('/status/:contentId', async (req, res) => {
    try {
        const { contentId } = req.params;
        
        // Find the content
        const content = await Course.findOne({
            where: { course_id: contentId },
            attributes: ['course_id', 'course_title', 'audio_location']
        });
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            data: {
                contentId: content.course_id,
                title: content.course_title,
                audioAvailable: !!content.audio_location,
                audioPath: content.audio_location || null
            },
            message: "Audio status retrieved successfully"
        });
        
    } catch (error) {
        console.error("Error checking audio status:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error occurred while checking audio status",
            error: error.message
        });
    }
});

// Get chapters audio status
router.get('/chapters/:contentType/:contentId', async (req, res) => {
    try {
        const { contentType, contentId } = req.params;
        
        // Path to metadata file
        const metadataPath = path.join(
            __dirname, 
            '../public/audio', 
            contentType, 
            contentId.toString(), 
            'metadata.json'
        );
        
        // Check if metadata exists
        if (!await fs.pathExists(metadataPath)) {
            return res.status(200).json({
                success: true,
                data: { 
                    chaptersWithAudio: {},
                    hasAudio: false 
                },
                message: "No audio files found for this content"
            });
        }
        
        // Get metadata
        const metadata = await fs.readJson(metadataPath);
        
        return res.status(200).json({
            success: true,
            data: {
                chaptersWithAudio: metadata.chapters || {},
                hasAudio: Object.keys(metadata.chapters || {}).length > 0
            },
            message: "Chapter audio status retrieved successfully"
        });
        
    } catch (error) {
        console.error("Error checking chapter audio status:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error occurred while checking chapter audio status",
            error: error.message
        });
    }
});

module.exports = router;