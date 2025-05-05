// audioWorker.js
const Course = require('../Models/CourseModel');
const { parentPort } = require('worker_threads');
const { generateChapterAudio } = require('../Utils/generateAudio'); // adapt this path

// Track memory usage
function logMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  console.log(`Worker Memory Usage - RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB, Heap: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}/${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`);
}

// Handle worker cleanup
function cleanup() {
  try {
    // Force garbage collection if available (requires --expose-gc when starting Node)
    if (global.gc) {
      global.gc();
      console.log('Worker garbage collection triggered');
    }
  } catch (e) {
    console.log('Unable to force garbage collection');
  }
  
  logMemoryUsage();
}

// Listen for messages from main thread
parentPort.on('message', async (task) => {
  logMemoryUsage();
  const { id, contentType, chapterIndex, chapterContent, voice } = task;

  try {
    // Send initial progress update
    parentPort.postMessage({ 
      chapterIndex, 
      progress: 5,
      status: 'starting' 
    });

    // Custom generateChapterAudio with progress reporting
    const audioPath = await generateChapterAudio({
      chapterContent,
      chapterIndex,
      voice,
      type: contentType,
      id,
      onProgress: (progress) => {
        // Report progress back to main thread
        parentPort.postMessage({ 
          chapterIndex, 
          progress: Math.min(progress, 95), // Cap at 95% until fully complete
          status: 'generating'
        });
      }
    });

    // Clear large variables to free memory
    task.chapterContent = null;

    // Send near-completion progress
    parentPort.postMessage({ 
      chapterIndex, 
      progress: 98,
      status: 'finalizing' 
    });

    // Update database with the new audio path
    const course = await Course.findOne({ where: { course_id: id } });
    if (!course) {
      throw new Error(`Course with ID ${id} not found`);
    }

    let audiosArray;
    try {
      audiosArray = Array.isArray(course.audios)
        ? [...course.audios]
        : JSON.parse(course.audios || '[]');
    } catch (e) {
      console.error(`Error parsing course audios: ${e.message}`);
      audiosArray = [];
    }

    if (audiosArray.length <= chapterIndex) {
      audiosArray.length = chapterIndex + 1;
    }

    audiosArray[chapterIndex] = audioPath;
    
    // Limit logging of large objects
    console.log(`Updating course ${id} with audio for chapter ${chapterIndex}`);
    
    await course.update({
      audios: audiosArray
    });

    // Send completion message
    parentPort.postMessage({ 
      chapterIndex, 
      progress: 100,
      status: 'complete',
      success: true, 
      audioPath,
      message: `Audio for chapter ${chapterIndex + 1} generated successfully.`
    });
    
    // Clean up resources after successful completion
    cleanup();
    
    // Important: Allow some time for final message to be processed before exiting
    setTimeout(() => {
      // Exit worker with success code
      if (parentPort) {
        console.log('Worker exiting with success code 0');
        parentPort.close(); // This seems to not be working correctly
        process.exit(0); // Force exit with success code
      }
    }, 1000);
    
  } catch (error) {
    console.error(`Worker error for chapter ${chapterIndex}:`, error);
    parentPort.postMessage({ 
      chapterIndex,
      success: false, 
      error: error.message || "An unknown error occurred",
      status: 'error'
    });
    
    // Clean up resources after error
    cleanup();
    
    // Exit after a delay
    setTimeout(() => {
      // Signal failure to parent
      if (parentPort) {
        console.log('Worker exiting with error code 1');
        parentPort.close(); // This seems to not be working correctly
        process.exit(1); // Force exit with error code
      }
    }, 1000);
  }
});

// Listen for exit signal from parent
parentPort.on('close', () => {
  console.log(`Worker exiting cleanly`);
  cleanup();
});
