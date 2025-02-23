const OpenAI = require('openai');
require('dotenv').config();

const openAi = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
});

const letsAi = async (prompt, maxTokens, rules) => {
    try {
        console.log("Sending request to OpenAI with prompt");
        
        const completion = await openAi.chat.completions.create({
            model: "gpt-4o-mini", 
            messages: [
                // { role: "system", content: "You are an expert course creator. Write detailed chapters with clear explanations, examples, and a summary." },
                { role: "system", content:  rules  || "You are an expert course creator. Write detailed chapters with clear explanations, examples, and a summary.", },

                { role: "user", content: prompt }
            ],
            max_tokens: maxTokens || null,
            top_p: 1
        });
        console.log("OpenAI response is here");
        return completion.choices[0]?.message?.content || "No response from AI";
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return "Error: Unable to generate response";
    }
};
module.exports = letsAi;





// 


