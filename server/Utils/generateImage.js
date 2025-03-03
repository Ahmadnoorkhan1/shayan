const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY
});

const generateImage = async (prompt) => {
    try {
        // Create images directory if it doesn't exist
        const imagesDir = path.join(__dirname, '../public/images');
        await fs.ensureDir(imagesDir);

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.png`;
        const filepath = path.join(imagesDir, filename);

        // Generate image with DALL-E
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            response_format: "url"
        });

        // Download image from URL
        const imageUrl = response.data[0].url;
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        await fs.writeFile(filepath, imageResponse.data);

        // Return local path that can be accessed through the server
        return `/images/${filename}`;

    } catch (error) {
        console.error("DALL-E Error:", error.message);
        return null;
    }
};

module.exports = { generateImage };