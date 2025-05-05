const express = require('express');
const { generateAudio, generateChapterAudio } = require('../Utils/generateAudio');
const Course = require('../Models/CourseModel');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const mergeMp3Files = require('../Utils/mergeMp3');
const { Worker } = require('worker_threads');
const path = require('path');
const router = express.Router();



// Modify your existing /combine endpoint to check for existing combined audio
router.post('/combine/:contentType/:contentId', async (req, res) => {
    try {
        const {  contentId } = req.params;
        
        const course = await Course.findOne({
            where:{
                course_id:contentId
            }
        });
        const audioUrls = JSON.parse(course.audios);
        let completeAudioBook
        if(audioUrls && Array.isArray(audioUrls)){
            completeAudioBook = await mergeMp3Files(audioUrls,contentId)
            course.audio_location=completeAudioBook;
            course.save();
        }
        return res.json({
            success:true,
            completeAudioBook: completeAudioBook,
        });       
    }
        
    catch (error) {
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
        const course = await Course.findOne({ where: { course_id: id } });

        let audioUrls = Array.isArray(course.audios) ? [...course.audios] : [];
        audioUrls[0] = (audioPath);
        // Update the content record with audio location
        await Course.update(
            { audios: audioUrls },
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
router.post('/generate-chapter/:id/:contentType', (req, res) => {
  const { id, contentType } = req.params;
  const { chapterIndex, chapterContent, voice } = req.body;

  if (!chapterContent || chapterIndex === undefined) {
    return res.status(400).json({ success: false, message: "Missing required parameters" });
  }

  if (!['course', 'book'].includes(contentType)) {
    return res.status(400).json({ success: false, message: "Invalid content type" });
  }

  // Get the socket.io instance
  const io = req.app.get('io');
  
  // Log memory usage before starting worker
  const memoryBefore = process.memoryUsage();
  console.log(`Memory before worker (${contentType} ${id}, chapter ${chapterIndex}):`, 
              `RSS: ${Math.round(memoryBefore.rss / 1024 / 1024)}MB`,
              `Heap: ${Math.round(memoryBefore.heapUsed / 1024 / 1024)}/${Math.round(memoryBefore.heapTotal / 1024 / 1024)}MB`);
  
  // Force garbage collection before starting new worker if available
  if (global.gc) {
    global.gc();
    console.log('Garbage collection triggered before starting worker');
  }
  
  // Create a worker thread for the audio generation
  let worker;
  try {
    worker = new Worker(path.resolve(__dirname, '../Worker/audioWorker.js'));
  } catch (err) {
    console.error('Failed to create worker:', err);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to initialize audio generation worker" 
    });
  }
  
  // Track start time for worker monitoring
  const workerStartTime = Date.now();
  
  // Set a maximum execution time (15 minutes)
  const MAX_WORKER_LIFETIME = 15 * 60 * 1000;
  const workerTimeout = setTimeout(() => {
    console.log(`Worker for ${contentType} ${id}, chapter ${chapterIndex} exceeded max lifetime, terminating...`);
    io.emit(`chapter-progress-${id}`, {
      chapterIndex: parseInt(chapterIndex),
      success: false,
      error: "Worker timeout - operation took too long",
      status: 'error'
    });
    
    try {
      worker.terminate();
    } catch (e) {
      console.error('Error terminating worker:', e);
    }
  }, MAX_WORKER_LIFETIME);

  // Send task to worker
  worker.postMessage({ id, contentType, chapterIndex, chapterContent, voice });
  
  // Free up the large content data from request memory
  req.body.chapterContent = null;

  // Listen for progress updates from worker and forward to client via socket
  worker.on('message', (msg) => {
    // Only log status changes, not every progress update to reduce log noise
    if (msg.status) {
      console.log(`Worker progress for ${contentType} ${id}, chapter ${chapterIndex}: ${msg.status}`);
    }
    
    // Forward the message to all clients listening for this specific chapter
    io.emit(`chapter-progress-${id}`, {
      ...msg,
      chapterIndex: parseInt(chapterIndex) // Ensure it's a number
    });
    
    // If worker is complete or errored, terminate it
    if (msg.status === 'complete' || msg.status === 'error') {
      clearTimeout(workerTimeout);
      
      // Log memory after worker completes
      const memoryAfter = process.memoryUsage();
      console.log(`Memory after worker (${contentType} ${id}, chapter ${chapterIndex}):`, 
                `RSS: ${Math.round(memoryAfter.rss / 1024 / 1024)}MB`,
                `Heap: ${Math.round(memoryAfter.heapUsed / 1024 / 1024)}/${Math.round(memoryAfter.heapTotal / 1024 / 1024)}MB`,
                `Duration: ${((Date.now() - workerStartTime) / 1000).toFixed(1)}s`);
      
      // Give worker a moment to clean up before termination
      setTimeout(() => {
        try {
          worker.terminate();
          console.log(`Worker for chapter ${chapterIndex} terminated cleanly`);
        } catch (e) {
          console.error('Error terminating worker:', e);
        }
      }, 1500);
      
      // Force garbage collection after worker completes if available
      if (global.gc) {
        setTimeout(() => {
          global.gc();
          console.log('Garbage collection triggered after worker completes');
        }, 2000);
      }
    }
  });

  // Handle worker errors
  worker.on('error', (err) => {
    console.error('Worker thread error:', err);
    clearTimeout(workerTimeout);
    
    // Notify clients about error
    io.emit(`chapter-progress-${id}`, {
      chapterIndex: parseInt(chapterIndex),
      success: false,
      error: err.message || 'Worker thread error',
      status: 'error'
    });
    
    try {
      worker.terminate();
    } catch (e) {
      console.error('Error terminating worker after error:', e);
    }
  });

  // Listen for worker exit
  worker.on('exit', (code) => {
    clearTimeout(workerTimeout);
    
    // Check for non-zero exit code (error)
    if (code !== 0 && code !== null) {
      console.error(`Worker stopped with exit code ${code}`);
      
      // Only emit error if it's a real error (not our intentional exit)
      io.emit(`chapter-progress-${id}`, {
        chapterIndex: parseInt(chapterIndex),
        success: false,
        error: `Worker process exited with code ${code}`,
        status: 'error'
      });
    } else {
      console.log(`Worker for chapter ${chapterIndex} exited with code ${code === null ? 'null' : code} (success)`);
      
      // Don't need to emit anything here as success should already be emitted in the message handler
    }
    
    // Suggest garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('Garbage collection triggered after worker exit');
    }
  });

  // Return immediately to client
  res.status(202).json({
    success: true,
    message: `Audio generation for chapter ${chapterIndex + 1} is in progress`
  });
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
        console.log(contentType);
        course = await Course.findOne({
            where:{
                course_id:contentId
            }
        }) 

        return res.json({
            succes:true,
            data: course
        })
        
        
       
        
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