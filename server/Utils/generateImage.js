const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY
});

const generateImage = async (prompt) => {
    try {
        const response = await openai.images.generate({
            model: "dall-e-3", // or "dall-e-2" for the older model
            prompt: prompt,
            n: 1, // Number of images to generate
            size: "1024x1024", // Image size (1024x1024, 512x512, or 256x256)
            quality: "standard", // "standard" or "hd" for DALL-E 3
            response_format: "url" // Returns a URL to the generated image
        });

        // Return the image URL from the response
        return response.data[0].url;

    } catch (error) {
        console.error("DALL-E Error:", error.message);
        return null;
    }
};

module.exports = { generateImage };