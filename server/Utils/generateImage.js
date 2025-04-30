const OpenAI = require('openai');
const { saveImage } = require('./fileStorage');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY
});

/**
 * Generates an image from a prompt and saves it to the filesystem
 * @param {string} prompt - The prompt to generate an image from
 * @param {Object} options - Additional options
 * @param {string} options.contentType - 'book' or 'course'
 * @param {string|number} options.contentId - ID of the book or course
 * @param {string} options.size - Image size (default: '1024x1024')
 * @returns {Object} - Image metadata
 */
const generateImage = async (prompt, options = {}) => {
  try {
    const { contentType = 'general', contentId = 'temp', size = '1024x1024', description = prompt.substring(0, 100) } = options;

    if (!contentId || contentId === 'temp') {
      throw new Error('Content ID is required for image storage');
    }

    console.log(`Generating image for ${contentType} ID ${contentId}: "${prompt}"`);

    // Generate image through OpenAI
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size,
      response_format: "b64_json",
    });

    if (!response || !response.data || !response.data[0] || !response.data[0].b64_json) {
      throw new Error("Invalid response structure from OpenAI");
    }

    // Get base64 image data
    const imageData = `data:image/png;base64,${response.data[0].b64_json}`;

    console.log("Image data received from OpenAI API");
    console.log("Image data:", imageData);

    // Save image to S3
    const imageMetadata = await saveImage(imageData, contentType, contentId, description);

    console.log("Image metadata:", imageMetadata);
    console.log("Image saved successfully:", imageMetadata.path);

    return {
      url: imageMetadata.path,
      metadata: imageMetadata,
    };
  } catch (error) {
    console.error("Error generating image:", error.message);
    throw error;
  }
};

module.exports = { generateImage };