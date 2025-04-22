const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY
});

/**
 * Generate titles based on provided criteria
 * @param {Object} data - The criteria for title generation
 * @returns {Array} - Array of generated titles
 */
const generateTitles = async (data) => {
    try {
        const { contentType = 'content', details = {}, count = 5, prompt : userInput } = data;
        
        // Extract details with defaults
        const { 
            style = 'Professional', 
            audience = 'General', 
            length = 'Medium',
            structure = 'Standard',
            tone = 'Neutral',
            media = 'Text-only'
        } = details;
        
        // Filter out only provided details
        const providedDetails = Object.entries({
            style, audience, length, structure, tone, media
        })
        .filter(([_, value]) => value)
        .map(([key, value]) => `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        .join('\n');
        
        // Create prompt for AI
        const prompt = `Generate ${count} engaging ${contentType} titles for the user prompt ${userInput} with the following characteristics:
        ${providedDetails}
        
        The titles should be clear, appropriate for the specified criteria, and engaging.
        Return only the titles as a numbered list without any additional text or explanation.`;
        
        // Call OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert content creator specializing in creating engaging titles. Return only a numbered list of titles without any explanations or additional text."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2048
        });
        
        const content = response.choices[0].message.content.trim();
        
        // Process the response to extract just the titles
        const titles = content
            .split('\n')
            .map(line => line.replace(/^\d+[\.\)]\s+/, '').trim())
            .filter(title => title); // Remove empty lines
        
        return titles;
        
    } catch (error) {
        console.error("Error generating titles:", error.message);
        throw new Error(`Failed to generate titles: ${error.message}`);
    }
};

module.exports = { generateTitles };