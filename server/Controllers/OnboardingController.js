const letsAi = require('../Utils/gpt');
const { generateTitles } = require('../Utils/titleGenerator');

/**
 * Generate titles for onboarding process
 */
const generateTitlesHandler = async (req, res) => {
    try {
        const { contentType, details, count } = req.body;
        
        // Validate minimum required input
        if (!contentType) {
            return res.status(400).json({ 
                success: false, 
                message: "contentType is required" 
            });
        }
        
        // Ensure details object exists, even if empty
        const validDetails = details || {};
        
        // Check if at least 3 details are provided
        const providedDetailCount = Object.values(validDetails).filter(Boolean).length;
        if (providedDetailCount < 3) {
            return res.status(400).json({ 
                success: false, 
                message: "At least 3 details must be provided" 
            });
        }
        
        const titles = await generateTitles({
            contentType,
            details: validDetails,
            count: count || 5
        });
        
        return res.status(200).json({
            success: true,
            data: titles,
            message: `${contentType} titles generated successfully`
        });
        
    } catch (error) {
        console.error("Error in title generation handler:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error occurred while generating titles",
            error: error.message
        });
    }
};


const generateFullContent = async (req, res) => {
    try {
        const { contentType, contentTitle, contentDetails, chapterCount = 5 } = req.body;
        
        // Validate required fields
        if (!contentType || !contentTitle || !contentDetails) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required parameters: contentType, contentTitle, and contentDetails are required" 
            });
        }
        
        // Extract details with defaults
        const { 
            style = 'Professional', 
            audience = 'General', 
            length = 'Medium'
        } = contentDetails;
        
        // Step 1: Generate a summary first
        const summaryPrompt = `Generate a comprehensive ${length} summary for a ${contentType} titled "${contentTitle}" 
        with the following characteristics:
        - Style: ${style}
        - Target Audience: ${audience}
        - Length: ${length}
        
        The summary should:
        - Introduce the main purpose of the ${contentType}
        - Provide an overview of key topics that will be covered
        - Highlight the benefits for the ${audience}
        - Follow a ${style} writing style that resonates with ${audience}
        - Be approximately ${length === 'Comprehensive' ? '600-800' : length === 'Medium' ? '400-600' : '200-400'} words in length
        
        Make sure to return only the summary text, without any additional formatting or meta-text.`;
        
        const summaryRules = `You are an expert content creator specializing in creating engaging ${contentType} content for ${audience}. 
        Your task is to generate a compelling summary that will serve as the foundation for a complete ${contentType}.
        Focus on quality, clarity, and maintaining an appropriate ${style} tone throughout.`;
        
        // Apply timeout for summary generation
        const summaryTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Summary generation timed out")), 30000)
        );
        
        const summaryResponse = await Promise.race([letsAi(summaryPrompt, 2048, summaryRules), summaryTimeout]);
        
        if (!summaryResponse) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to generate content summary" 
            });
        }
        
        // Step 2: Generate chapter titles based on the summary
        const chapterTitlesPrompt = `Based on the following summary for a ${contentType} titled "${contentTitle}", 
        generate ${chapterCount} chapter titles that would logically organize the content:
        
        ${summaryResponse}
        
        Return only the numbered chapter titles, one per line, without any additional text.`;
        
        const chapterTitlesTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Chapter titles generation timed out")), 30000)
        );
        
        const chapterTitlesResponse = await Promise.race([
            letsAi(chapterTitlesPrompt, 1024, "Generate only chapter titles, numbered, one per line."), 
            chapterTitlesTimeout
        ]);
        
        if (!chapterTitlesResponse) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to generate chapter titles" 
            });
        }
        
        // Process chapter titles
        const chapterTitles = chapterTitlesResponse
            .split('\n')
            .map(line => line.replace(/^\d+\.?\s*/, '').trim())
            .filter(title => title.length > 0);
            
        // Step 3: Generate content for each chapter
        const chapters = [];
        
        for (let i = 0; i < chapterTitles.length; i++) {
            const chapterTitle = chapterTitles[i];
            const chapterNumber = i + 1;
            
            // Adapt prompt based on content type
            let chapterStructure;
            
            if (contentType.toLowerCase().includes('education') || contentType.toLowerCase().includes('course')) {
                chapterStructure = `
                <h1>Chapter ${chapterNumber}: ${chapterTitle}</h1>
                
                <p>Introduction paragraph here...</p>
                
                <h2>Key Concepts</h2>
                <p>Content here...</p>
                
                <h2>Main Topics</h2>
                <p>Content with <strong>bold</strong> and <em>italic</em> text where needed.</p>
                
                <ul>
                    <li>Key points</li>
                    <li>Important concepts</li>
                </ul>
                
                <h2>Summary</h2>
                <p>Concluding paragraph here...</p>`;
            } 
            else if (contentType.toLowerCase().includes('training') || contentType.toLowerCase().includes('workshop')) {
                chapterStructure = `
                <h1>Module ${chapterNumber}: ${chapterTitle}</h1>
                
                <p>Introduction to this module...</p>
                
                <h2>Learning Objectives</h2>
                <ul>
                    <li>First objective</li>
                    <li>Second objective</li>
                </ul>
                
                <h2>Core Content</h2>
                <p>Main training content here with <strong>important points</strong> highlighted.</p>
                
                <h2>Practical Application</h2>
                <p>How to apply these concepts in real-world situations.</p>
                
                <h2>Key Takeaways</h2>
                <p>Summary of main points learned in this module.</p>`;
            }
            else if (contentType.toLowerCase().includes('book') || contentType.toLowerCase().includes('novel')) {
                chapterStructure = `
                <h1>Chapter ${chapterNumber}: ${chapterTitle}</h1>
                
                <p>Opening narrative paragraph...</p>
                
                <p>Development of plot and character interactions...</p>
                
                <p>Conflict or tension point in this chapter...</p>
                
                <p>Resolution or cliffhanger ending the chapter...</p>`;
            }
            else {
                chapterStructure = `
                <h1>Section ${chapterNumber}: ${chapterTitle}</h1>
                
                <p>Introduction paragraph...</p>
                
                <h2>Main Points</h2>
                <p>Content with <strong>highlighted elements</strong> as needed.</p>
                
                <h2>Details</h2>
                <ul>
                    <li>First important detail</li>
                    <li>Second important detail</li>
                </ul>
                
                <h2>Conclusion</h2>
                <p>Wrapping up this section...</p>`;
            }
            
            const chapterPrompt = `Write a detailed ${contentType} chapter of 500-800 words for Chapter ${chapterNumber}: ${chapterTitle} 
            of the ${contentType} titled "${contentTitle}". The overall summary of the ${contentType} is:
            
            ${summaryResponse.substring(0, 300)}...
            
            Use HTML formatting with the following structure:
            ${chapterStructure}
            
            Make sure to:
            - Write in a ${style} style suitable for ${audience}
            - Include proper content depth appropriate for the ${length} format
            - Use proper HTML tags
            - Return only the formatted HTML content without any markdown
            - Make all content completely original and engaging`;
            
            const chapterTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Chapter ${chapterNumber} generation timed out`)), 60000)
            );
            
            try {
                const chapterContent = await Promise.race([
                    letsAi(chapterPrompt, 4096, `You are writing chapter ${chapterNumber} of a ${contentType} for ${audience}.`), 
                    chapterTimeout
                ]);
                
                if (chapterContent) {
                    chapters.push({
                        chapterNumber,
                        title: chapterTitle,
                        content: chapterContent
                    });
                }
            } catch (chapterError) {
                console.error(`Error generating chapter ${chapterNumber}:`, chapterError.message);
                // Continue with other chapters even if one fails
            }
        }
        
        return res.status(200).json({
            success: true,
            data: {
                contentType,
                contentTitle,
                summary: summaryResponse,
                chapters: chapters,
                metadata: contentDetails
            },
            message: `Complete ${contentType} generated successfully with ${chapters.length} chapters`
        });
        
    } catch (error) {
        console.error("Error generating full content:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error occurred while generating content",
            error: error.message
        });
    }
};

module.exports = {
    generateTitlesHandler,
    generateFullContent
};