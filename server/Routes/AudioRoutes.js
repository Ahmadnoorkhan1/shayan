const express = require('express');
const { generateAudio, generateChapterAudio } = require('../Utils/generateAudio');
const Course = require('../Models/CourseModel');
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');

const router = express.Router();



// Modify your existing /combine endpoint to check for existing combined audio
router.post('/combine/:contentType/:contentId', async (req, res) => {
    try {
        const { contentType, contentId } = req.params;
        const timeout = req.query.timeout ? parseInt(req.query.timeout) : 300000; // Default 5 minutes
        const forceRegenerate = req.query.force === 'true'; // Optional param to force regeneration
        
        // Validate the content type
        if (contentType !== 'course' && contentType !== 'book') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid content type. Must be 'course' or 'book'." 
            });
        }
        
        // Path to the content's audio directory
        const audioDir = path.join(__dirname, '../public/audio', contentType, contentId.toString());
        const chaptersDir = path.join(audioDir, 'chapters');
        const metadataPath = path.join(audioDir, 'metadata.json');
        
        // Check if metadata exists
        if (!await fs.pathExists(metadataPath)) {
            return res.status(404).json({
                success: false,
                message: "No audio chapters found for this content"
            });
        }
        
        // Get metadata with chapter information
        const metadata = await fs.readJson(metadataPath);
        
        // CHECK IF COMBINED AUDIO ALREADY EXISTS
        if (!forceRegenerate && metadata.combinedAudio && metadata.combinedAudio.path) {
            // Get the full file path from the stored path
            const existingFilePath = path.join(__dirname, '..', 'public', metadata.combinedAudio.path.replace(/^\//, ''));
            
            // Check if file still exists
            if (await fs.pathExists(existingFilePath)) {
                console.log(`Using existing combined audio for ${contentType} ${contentId}`);
                
                // Get content details for title
                const content = await Course.findByPk(contentId, {
                    attributes: ['course_id', 'course_title']
                });
                
                return res.status(200).json({
                    success: true,
                    data: {
                        audioPath: metadata.combinedAudio.path,
                        title: content ? content.course_title : 'Unknown',
                        contentType,
                        contentId,
                        chapterCount: metadata.combinedAudio.chapterCount || 'Unknown',
                        fileSize: metadata.combinedAudio.fileSize || 0,
                        fileSizeMB: metadata.combinedAudio.fileSizeMB || 'Unknown',
                        createdAt: metadata.combinedAudio.createdAt || new Date().toISOString(),
                        isExisting: true
                    },
                    message: `Returning existing combined audio for ${contentType}`
                });
            }
            console.log(`Existing combined audio file not found, regenerating for ${contentType} ${contentId}`);
        }
        
        // Continue with existing code to generate combined audio...
        if (!metadata.chapters || Object.keys(metadata.chapters).length === 0) {
            return res.status(404).json({
                success: false,
                message: "No chapter audio files available to combine"
            });
        }
        
        // Get content details for title
        const content = await Course.findByPk(contentId, {
            attributes: ['course_id', 'course_title']
        });
        
        if (!content) {
            return res.status(404).json({ 
                success: false, 
                message: `${contentType === 'book' ? 'Book' : 'Course'} not found` 
            });
        }
        
        // Create a safe filename
        const timestamp = Date.now();
        const safeTitle = content.course_title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const outputFilename = `${safeTitle}_complete_${timestamp}.mp3`;
        const outputPath = path.join(audioDir, outputFilename);
        const publicPath = `/audio/${contentType}/${contentId}/${outputFilename}`;
        
        // Sort chapters by index to ensure correct order
        const chapterIndices = Object.keys(metadata.chapters).map(idx => parseInt(idx));
        chapterIndices.sort((a, b) => a - b);
        
        // Create a list of input files in order
        const inputFiles = chapterIndices.map(idx => {
            const chapterFile = path.join(chaptersDir, `chapter_${idx}.mp3`);
            if (!fs.existsSync(chapterFile)) {
                throw new Error(`Chapter file missing: chapter_${idx}.mp3`);
            }
            return chapterFile;
        });
        
        console.log(`Combining ${inputFiles.length} audio files for ${contentType} ${contentId}`);
        
        // Custom function to combine audio files using Node.js streams
        const combineStartTime = Date.now();
        
        // Create output file stream
        const outputStream = fs.createWriteStream(outputPath);
        
        // Set a timeout for the entire operation
        const combineTimeout = setTimeout(() => {
            outputStream.end();
            throw new Error("Audio combination process timed out");
        }, timeout);
        
        try {
            // Process each file in sequence using streams
            for (const file of inputFiles) {
                console.log(`Processing file: ${path.basename(file)}`);
                
                // Wait for each file to be fully processed
                await new Promise((resolve, reject) => {
                    const readStream = fs.createReadStream(file);
                    
                    readStream.on('error', (err) => {
                        console.error(`Error reading file ${file}:`, err);
                        reject(err);
                    });
                    
                    // Pipe the file content to the output stream without closing it
                    readStream.pipe(outputStream, { end: false });
                    
                    readStream.on('end', () => {
                        console.log(`Finished processing: ${path.basename(file)}`);
                        resolve();
                    });
                });
            }
            
            // Close the output stream when all files have been processed
            outputStream.end();
            
            // Wait for the file writing to complete
            await new Promise((resolve, reject) => {
                outputStream.on('finish', () => {
                    console.log('All files have been combined successfully');
                    resolve();
                });
                
                outputStream.on('error', (err) => {
                    console.error('Error writing combined audio file:', err);
                    reject(err);
                });
            });
            
            // Clear the timeout as the operation completed successfully
            clearTimeout(combineTimeout);
            
            const combineEndTime = Date.now();
            const combineTime = (combineEndTime - combineStartTime) / 1000;
            console.log(`Audio files combined in ${combineTime.toFixed(2)} seconds`);
            
            // Get combined file size
            const fileStats = await fs.stat(outputPath);
            const fileSizeInMB = (fileStats.size / (1024 * 1024)).toFixed(2);
            
            // Update metadata to include the combined file
            metadata.combinedAudio = {
                path: publicPath,
                createdAt: new Date().toISOString(),
                chapterCount: inputFiles.length,
                filename: outputFilename,
                fileSize: fileStats.size,
                fileSizeMB: `${fileSizeInMB} MB`
            };
            
            await fs.writeJson(metadataPath, metadata, { spaces: 2 });
            
            // Return success with the path to the combined audio
            return res.status(200).json({
                success: true,
                data: {
                    audioPath: publicPath,
                    title: content.course_title,
                    contentType,
                    contentId,
                    chapterCount: inputFiles.length,
                    fileSize: fileStats.size,
                    fileSizeMB: `${fileSizeInMB} MB`,
                    processingTime: `${combineTime.toFixed(2)} seconds`
                },
                message: `All chapter audio files combined successfully for ${contentType}`
            });
        } catch (error) {
            // Clean up the incomplete file if an error occurs
            clearTimeout(combineTimeout);
            outputStream.end();
            if (fs.existsSync(outputPath)) {
                await fs.unlink(outputPath);
            }
            throw error;
        }
    } catch (error) {
        console.error("Error combining audio files:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error occurred while combining audio files",
            error: error.message
        });
    }
});

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
            message: `Chapter ${chapterIndex + 1} audio generated successfully`
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