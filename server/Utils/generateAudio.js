const OpenAI = require('openai');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY
});

/**
 * Prepares text content for audio conversion by removing HTML tags
 * and formatting it for optimal speech synthesis
 * 
 * @param {Object} content - The chapter content with HTML formatting
 * @returns {String} - Clean text ready for audio conversion
 */
const prepareContentForAudio = (content) => {
    try {
        let preparedText = '';
        
        // Handle different types of content structure
        if (Array.isArray(content)) {
            // For array-based chapter structure
            content.forEach(chapter => {
                if (!chapter) return;
                
                // Extract chapter title
                const chapterTitle = chapter.title || `Chapter ${chapter.chapterNumber || ''}`;
                preparedText += `${chapterTitle}.\n\n`;
                
                // Process chapter content
                let chapterContent = chapter.content || '';
                
                // Remove HTML tags
                chapterContent = chapterContent.replace(/<[^>]*>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .replace(/\n+/g, '\n')
                    .trim();
                
                preparedText += `${chapterContent}\n\n`;
            });
        } else if (typeof content === 'object') {
            // For object-based content with chapters as properties
            Object.keys(content).forEach(key => {
                if (key.toLowerCase().includes('chapter') || key.toLowerCase().includes('section')) {
                    const chapterContent = content[key];
                    
                    // Extract chapter title
                    preparedText += `${key}.\n\n`;
                    
                    // Process chapter content
                    let cleanContent = '';
                    if (typeof chapterContent === 'string') {
                        cleanContent = chapterContent;
                    } else if (typeof chapterContent === 'object' && chapterContent.content) {
                        cleanContent = chapterContent.content;
                    }
                    
                    // Remove HTML tags
                    cleanContent = cleanContent.replace(/<[^>]*>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .replace(/\n+/g, '\n')
                        .trim();
                    
                    preparedText += `${cleanContent}\n\n`;
                }
            });
        } else if (typeof content === 'string') {
            // For simple string content
            preparedText = content.replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, '\n')
                .trim();
        }
        
        // Add natural pauses for better audio flow
        preparedText = preparedText
            .replace(/\./g, '. ') // Add slight pause after periods
            .replace(/\!/g, '! ') // Add slight pause after exclamations
            .replace(/\?/g, '? ') // Add slight pause after questions
            .replace(/\n/g, '\n\n') // Add paragraph breaks
            .replace(/\s+/g, ' ') // Clean up extra spaces
            .trim();
            
        return preparedText;
    } catch (error) {
        console.error("Error preparing content for audio:", error);
        return "Error occurred while preparing content for audio conversion.";
    }
};

/**
 * Generates audio for provided content
 * 
 * @param {Object} data - Content data including title and content
 * @returns {String} - Path to the generated audio file
 */
const generateAudio = async (data) => {
    try {
        // Extract data
        const { title, content, voice = 'alloy' } = data;
        
        // Create unique filename based on title and timestamp
        const timestamp = Date.now();
        const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${safeTitle}_${timestamp}.mp3`;
        
        // Create audio directory if it doesn't exist
        const audioDir = path.join(__dirname, '../public/audio');
        await fs.ensureDir(audioDir);
        const filepath = path.join(audioDir, filename);
        
        // Prepare content for audio conversion
        const preparedText = prepareContentForAudio(content);
        
        // Create an array to store audio buffers
        const audioBuffers = [];
        
        // Process content in chunks (OpenAI limit is 4096 characters)
        const MAX_CHUNK_SIZE = 3500; // Leave some margin below the 4096 limit
        
        // Split text into natural chunks (sentences and paragraphs)
        const chunks = [];
        
        // Split by paragraphs first
        const paragraphs = preparedText.split(/\n{2,}/);
        let currentChunk = '';
        
        // Process each paragraph
        for (const paragraph of paragraphs) {
            // If this paragraph would make the chunk too large
            if (currentChunk.length + paragraph.length > MAX_CHUNK_SIZE) {
                // If the current chunk already has content
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = '';
                }
                
                // If the paragraph itself is too large, split into sentences
                if (paragraph.length > MAX_CHUNK_SIZE) {
                    // Split by sentences (period, question mark, exclamation mark followed by space)
                    const sentences = paragraph.split(/(?<=[.!?])\s+/);
                    
                    for (const sentence of sentences) {
                        if (currentChunk.length + sentence.length > MAX_CHUNK_SIZE) {
                            if (currentChunk.length > 0) {
                                chunks.push(currentChunk);
                                currentChunk = sentence + ' ';
                            } else {
                                // If a single sentence is too long, we need to split by words
                                if (sentence.length > MAX_CHUNK_SIZE) {
                                    const words = sentence.split(' ');
                                    let wordChunk = '';
                                    
                                    for (const word of words) {
                                        if (wordChunk.length + word.length + 1 > MAX_CHUNK_SIZE) {
                                            chunks.push(wordChunk);
                                            wordChunk = word + ' ';
                                        } else {
                                            wordChunk += word + ' ';
                                        }
                                    }
                                    
                                    if (wordChunk.length > 0) {
                                        currentChunk = wordChunk;
                                    }
                                } else {
                                    chunks.push(sentence);
                                }
                            }
                        } else {
                            currentChunk += sentence + ' ';
                        }
                    }
                } else {
                    currentChunk = paragraph + '\n\n';
                }
            } else {
                currentChunk += paragraph + '\n\n';
            }
        }
        
        // Add the last chunk if not empty
        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }
        
        console.log(`Content split into ${chunks.length} chunks for audio processing`);
        
        // Process each chunk
        for (let i = 0; i < chunks.length; i++) {
            try {
                console.log(`Processing audio chunk ${i+1}/${chunks.length}, length: ${chunks[i].length} characters`);
                
                // Generate audio for this chunk
                const response = await openai.audio.speech.create({
                    model: "tts-1",
                    voice: voice,
                    input: chunks[i],
                    response_format: "mp3"
                });
                
                // Get audio data as buffer
                const chunkBuffer = Buffer.from(await response.arrayBuffer());
                
                // Add to our collection of audio buffers
                audioBuffers.push(chunkBuffer);
                
                // Add a small pause between audio chunks for natural flow
                if (i < chunks.length - 1) {
                    // Create a small silence buffer (500ms)
                    const silence = Buffer.alloc(4000); // Small silence buffer
                    audioBuffers.push(silence);
                }
            } catch (chunkError) {
                console.error(`Error processing chunk ${i+1}:`, chunkError.message);
                // Continue with other chunks even if one fails
            }
        }
        
        // Combine all audio buffers
        const combinedAudioBuffer = Buffer.concat(audioBuffers);
        
        // Save the combined audio file
        await fs.writeFile(filepath, combinedAudioBuffer);
        
        // Return the path to the audio file
        return `/audio/${filename}`;
        
    } catch (error) {
        console.error("Audio Generation Error:", error.message);
        return null;
    }
};

module.exports = { generateAudio };