// const { default: OpenAI } = require('openai');
const Course = require('../Models/CourseModel');
const letsAi = require('../Utils/gpt');
const { generateTitles } = require('../Utils/titleGenerator');
const OpenAI = require('openai')

const openAi = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
});

/**
 * Generate titles for onboarding process
 */
const generateTitlesHandler = async (req, res) => {
    try {
        const { contentType, details, count, prompt } = req.body;
        
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
            count: count || 5,
            prompt
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

/**
 * Generate a comprehensive summary for onboarding content with expanded options
 * @param {Object} req - Request object with content details
 * @param {Object} res - Response object
 */
const generateSummaryHandler = async (req, res) => {
    try {
        const { contentType, contentCategory, contentTitle, contentDetails } = req.body;


        console.dir('Received request to generate summary:', {
            contentType,
            contentCategory,
            contentTitle,
            contentDetails
        });

        // Validation
        if (!contentType || !contentCategory || !contentTitle || !contentDetails) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Extract all possible content details with defaults
        const audience = contentDetails.audience || 'General Adult Readers';
        const style = contentDetails.style || 'Conversational';
        const length = contentDetails.length || 'Standard';
        
        // Advanced options
        const structure = contentDetails.structure || 'Standard Chapters';
        const tone = contentDetails.tone || 'Neutral';
        const media = contentDetails.media || 'Text-only';

        // ------ Mapping functions for all possible options ------
        
        // Target Audience mapping
        const getAudienceInstruction = (audience) => {
            const audienceMap = {
                'Children (Ages 5-12)': 'Write for young children ages 5-12. Use simple language, engaging examples, and a friendly approach. Avoid complex concepts without clear explanations.',
                'Young Adults (Ages 13-17)': 'Write for teenagers ages 13-17. Use relatable examples, moderate complexity, and an engaging style that respects their intelligence without being condescending.',
                'College Students': 'Write for undergraduate or graduate students. Include academic concepts, references to scholarly work, and critical thinking elements.',
                'Professionals': 'Write for working professionals. Focus on practical applications, industry relevance, and professional development. Use examples from workplace contexts.',
                'General Adult Readers': 'Write for a general adult audience with mixed backgrounds. Balance accessibility with depth and use diverse examples.',
                'Beginners': 'Write for complete beginners to the subject. Explain all terminology, use basic examples, and build concepts progressively.',
                'Intermediate Learners': 'Write for those with foundational knowledge. Can use some specialized terms with brief explanations and more complex examples.',
                'Advanced Practitioners': 'Write for experts and experienced practitioners. Can use technical language, advanced concepts, and sophisticated analysis.',
                'Executives': 'Write for decision-makers and leaders. Focus on strategic insights, high-level implications, and executive summaries. Emphasize business value.',
                'Educators': 'Write for teachers and educational professionals. Include pedagogical approaches, teaching strategies, and classroom applications.'
            };
            return audienceMap[audience] || audienceMap['General Adult Readers'];
        };
        
        // Content Style mapping
        const getStyleInstruction = (style) => {
            const styleMap = {
                'Academic': 'Use formal language, cite concepts, and employ structured arguments. Include theoretical frameworks and scholarly approaches.',
                'Conversational': 'Use friendly, engaging language with a personal touch. Include rhetorical questions and relatable examples.',
                'Technical': 'Focus on precise, detailed explanations with technical terminology and process-oriented descriptions. Include specifications where relevant.',
                'Narrative': 'Use storytelling elements with a clear narrative arc. Incorporate scenarios, characters, or case examples to illustrate points.',
                'Instructional': 'Provide clear, step-by-step guidance with explicit directions. Use imperative voice where appropriate and include practice activities.',
                'Poetic': 'Incorporate creative language, metaphors, and expressive descriptions. Balance artistic elements with clarity of information.',
                'Journalistic': 'Present information in a factual, objective manner with attention to current relevance. Use the inverted pyramid structure where appropriate.',
                'Business': 'Focus on actionable insights, ROI, and practical business applications. Use concise language and highlight strategic implications.'
            };
            return styleMap[style] || styleMap['Conversational'];
        };

        // Length/Depth mapping
        const getLengthInstruction = (length) => {
            const lengthMap = {
                'Brief': 'Create concise content with 4-5 short sections. Focus on essential information only and limit examples.',
                'Standard': 'Develop moderate-length content with 6-8 detailed sections. Balance depth with accessibility.',
                'Comprehensive': 'Create in-depth content with 8-10 extensive sections. Include detailed explanations, multiple examples, and thorough coverage of the topic.',
                'In-depth': 'Develop extremely detailed content with 10+ extensive sections. Include comprehensive analysis, extensive examples, and explore subtopics thoroughly.',
                'Bite-sized': 'Create very short, focused content chunks with 3-4 brief sections. Make each section self-contained and quickly consumable.',
                'Extended Series': 'Design content as part of a series with 6-8 sections that connect to future content. Include previews of related topics.'
            };
            return lengthMap[length] || lengthMap['Standard'];
        };

        // Content Structure mapping
        const getStructureInstruction = (structure) => {
            const structureMap = {
                'Standard Chapters': 'Organize content into traditional chapters with clear hierarchy and sequential flow.',
                'Modules/Lessons': 'Structure content as educational modules with learning objectives, content, activities, and assessments.',
                'Q&A Format': 'Present information through questions and comprehensive answers that anticipate reader needs.',
                'Step-by-Step Guide': 'Organize as a sequential process with numbered steps, clear instructions, and progression logic.',
                'Case Studies': 'Center content around detailed examples with analysis, lessons learned, and applications.',
                'Theory & Practice': 'Alternate between conceptual explanations and practical applications or exercises.',
                'Problem-Solution': 'Present challenges or issues followed by detailed solutions and implementation guidance.',
                'Sequential Learning': 'Structure as a progressive learning path where each section builds on previous knowledge.',
                'Thematic Organization': 'Organize around key themes or topics with connections between related concepts.'
            };
            return structureMap[structure] || structureMap['Standard Chapters'];
        };

        // Tone mapping
        const getToneInstruction = (tone) => {
            const toneMap = {
                'Formal': 'Maintain a professional, detached tone with precise language and minimal personal elements.',
                'Informal': 'Use a relaxed, approachable tone with contractions, personal anecdotes, and casual expressions.',
                'Humorous': 'Incorporate appropriate humor, wit, and light-hearted examples without compromising information quality.',
                'Serious': 'Maintain a grave, earnest tone appropriate for weighty or critical subjects.',
                'Inspirational': 'Use motivational language that encourages action and positive mindset with uplifting examples.',
                'Critical': 'Employ analytical, evaluative language that examines multiple perspectives with reasoned judgments.',
                'Neutral': 'Maintain an objective, balanced tone that presents information without obvious bias.',
                'Enthusiastic': 'Use energetic, passionate language that conveys excitement about the subject matter.',
                'Authoritative': 'Project expertise and confidence with definitive statements backed by evidence or experience.'
            };
            return toneMap[tone] || toneMap['Neutral'];
        };

        // Media Type mapping
        const getMediaInstruction = (media) => {
            const mediaMap = {
                'Text-only': 'Create content optimized for text-only presentation with strong verbal descriptions.',
                'Text with Graphics': 'Design content with spots where charts, diagrams, or infographics would enhance text explanations.',
                'Illustrated': 'Create content with regular points where illustrations or images would complement the text.',
                'Interactive Elements': 'Design content with opportunities for quizzes, exercises, or interactive components.',
                'Video Support': 'Create content that could be enhanced with video demonstrations or explanations.',
                'Audio Companion': 'Optimize content for both reading and listening with clear spoken language patterns.',
                'Multi-format': 'Design flexible content adaptable to multiple formats (text, visual, audio, interactive).'
            };
            return mediaMap[media] || mediaMap['Text-only'];
        };

        console.log("Generating summary with the following details:", {
            contentType,
            contentCategory,
            contentTitle,
            audience,
            style,
            length,
            structure,
            tone,
            media
        }
        )

        // Craft the prompt with detailed instructions based on all options
        const prompt = `Generate a comprehensive HTML summary for "${contentTitle}" which is a ${contentType} in the category of ${contentCategory}.

CONTENT SPECIFICATIONS:
- Target Audience: ${getAudienceInstruction(audience)}
- Content Style: ${getStyleInstruction(style)}
- Length/Depth: ${getLengthInstruction(length)}
- Content Structure: ${getStructureInstruction(structure)}
- Tone: ${getToneInstruction(tone)}
- Media Type: ${getMediaInstruction(media)}

REQUIRED HTML STRUCTURE:
<div class="summary-container">
    <div class="summary-section">
        <h2>Introduction</h2>
        <p>[Compelling introduction that presents the main thesis and purpose of the content]</p>
    </div>
    
    <div class="summary-section">
        <h2>Overview</h2>
        <p>[High-level overview of what readers will learn and why it matters]</p>
    </div>
    
    <div class="summary-section">
        <h2>Key Topics</h2>
        <ul>
            <li><strong>Topic 1:</strong> [Brief description]</li>
            <li><strong>Topic 2:</strong> [Brief description]</li>
            <li><strong>Topic 3:</strong> [Brief description]</li>
            [Add more topics as appropriate based on content length]
        </ul>
    </div>
    
    <div class="summary-section">
        <h2>Main Content Sections</h2>
        <p>[Overview of how the content is organized]</p>
        <ol>
            <li><strong>Section 1:</strong> [Description with key points]</li>
            <li><strong>Section 2:</strong> [Description with key points]</li>
            [Continue with all major sections]
        </ol>
    </div>
    
    <div class="summary-section">
        <h2>Learning Outcomes</h2>
        <p>[What readers will gain from this content]</p>
        <ul>
            <li>[Specific outcome 1]</li>
            <li>[Specific outcome 2]</li>
            <li>[Specific outcome 3]</li>
            [Add more outcomes as appropriate]
        </ul>
    </div>
    
    <div class="summary-section">
        <h2>Target Readers</h2>
        <p>[Description of who would benefit most from this content]</p>
    </div>
</div>

IMPORTANT REQUIREMENTS:
1. Generate COMPLETE content for EACH heading - do not skip any sections.
2. Use proper HTML formatting with nested elements.
3. Be specific to the title and type of content.
4. Keep each section concise but comprehensive. 
5. Ensure all content is factually accurate and educational.
6. Include relevant keywords and concepts for the subject matter.
7. Make sure each heading has substantial content - at least 2-3 sentences per paragraph.
8. Do NOT use placeholder text or incomplete sections.
9. Adapt content structure to match the specified "${structure}" format.
10. Use the specified "${media}" approach in your content recommendations.

The summary should be comprehensive enough to give readers a clear understanding of what to expect from the full content.`;


// const chapterCount = Math.floor(Math.random() * 6) + 10; // Random number between 10-15
        const chapterCount = contentDetails?.numOfChapters; // Fixed number of chapters for now
        const chapterTitlesPrompt = `Generate ${chapterCount} engaging chapter titles for "${contentTitle}" which is a ${contentType} in the category of ${contentCategory}.

        CONTENT SPECIFICATIONS:
        - Target Audience: ${getAudienceInstruction(audience)}
        - Content Style: ${getStyleInstruction(style)}
        - Content Structure: ${getStructureInstruction(structure)}
        - Tone: ${getToneInstruction(tone)}
        
        REQUIREMENTS:
        1. Create exactly ${chapterCount} chapter titles.
        2. Titles should be concise yet descriptive (5-10 words each).
        3. The sequence should follow a logical progression appropriate for the "${structure}" format.
        4. Include a mix of engaging, informative, and action-oriented titles.
        5. Match the tone and style specifications.
        6. Ensure titles are appropriate for the target audience.
        7. Make each title unique and specific to the content.
        8. For EACH chapter title, include 3 brief key points that will be covered in that chapter.
        9. Key points should be concise (5-10 words each) and highlight important subtopics.
        
        Format your response as follows:
        1. [First Chapter Title]
           - Key point one
           - Key point two
           - Key point three
        2. [Second Chapter Title]
           - Key point one
           - Key point two
           - Key point three
        ...and so on.`;

        // Call OpenAI API to generate the summary
        const [summaryResponse, chapterTitlesResponse] = await Promise.all([
            openAi.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system", 
                        content: "You are an expert educational content developer specializing in creating well-structured, comprehensive summaries for educational materials."
                    },
                    { 
                        role: "user", 
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                top_p: 1,
            }),
            
            openAi.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system", 
                        content: "You are an expert educational content developer specializing in creating engaging, descriptive chapter titles."
                    },
                    { 
                        role: "user", 
                        content: chapterTitlesPrompt
                    }
                ],
                temperature: 0.8, // Slightly higher temperature for more creative titles
                max_tokens: 800
,
top_p: 1,            })
        ]);



      // Process chapter titles and key points
const rawChapterTitles = chapterTitlesResponse.choices[0].message.content.trim();

// Parse the response into structured chapters with key points
const chapters = [];

// Split the content by chapter numbers (looking for patterns like "1. ", "2. ", etc.)
const chapterBlocks = rawChapterTitles.split(/\n\s*\d+\.\s+/).filter(Boolean);

// Extract chapter numbers from the original content
const chapterRegex = /(\d+)\.\s+/g;
const chapterNumbers = [];
let match;

while ((match = chapterRegex.exec(rawChapterTitles)) !== null) {
    chapterNumbers.push(parseInt(match[1], 10));
}

// Process each chapter block
chapterBlocks.forEach((block, index) => {
    // Skip if we've reached the desired chapter count
    if (index >= chapterCount) return;
    
    // Split lines and process them
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    
    if (lines.length === 0) return;
    
    // First line is the title (remove any markdown formatting)
    const title = lines[0].replace(/\*\*/g, '').trim();
    
    // Remaining lines that start with "-" are key points
    const keyPoints = lines
        .slice(1)
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.substring(line.indexOf('-') + 1).trim());
    
    // Get chapter number from extracted numbers or use index+1
    const chapterNo = (index < chapterNumbers.length) ? 
        chapterNumbers[index] : index + 1;
    
    // Add to chapters array
    chapters.push({
        chapterNo: chapterNo,
        title: title,
        keyPoints: keyPoints
    });
});

// Debug output
console.log(`Parsed ${chapters.length} chapters with key points`);

// Ensure we have the correct number of chapter titles
if (chapters.length < chapterCount) {
    console.warn(`Expected ${chapterCount} chapter titles, but only ${chapters.length} were generated.`);
}

// Return both the summary and structured chapters
return res.status(200).json({
    success: true,
    data: {
        summary: summaryResponse.choices[0].message.content.trim(),
        chapters: chapters,
        title: contentTitle,
        contentType,
        contentCategory,
        contentDetails: {
            audience,
            style,
            length,
            structure,
            tone,
            media
        }
    },
    message: 'Summary, chapter titles and key points generated successfully'
});

    } catch (error) {
        console.error('Error generating summary:', error);
        return res.status(500).json({
            success: false,
            message: 'Error generating summary',
            error: error.message
        });
    }
};

const generateChapterContentHandler = async (req, res) => {
    try {
        const data = req.body;
        
        console.log("Received chapter content generation request:", JSON.stringify(data, null, 2));
        
        // Validation with better error messages
        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'Request body is empty'
            });
        }
        
        // Access fields directly from request body
        const chapterNo = data.chapterNo;
        const chapter = data.chapter;
        const title = data.title;
        const summary = data.summary;
        
        // Validate all required fields
        if (!chapterNo) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: chapterNo'
            });
        }
        
        if (!chapter) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: chapter'
            });
        }
        
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: title'
            });
        }
        
        if (!summary) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: summary'
            });
        }

        console.log(`Generating content for Chapter ${chapterNo}: ${chapter} of "${title}"`);
        
        // Parse the summary to extract relevant information for context
        const summaryText = summary.replace(/<[^>]*>/g, ' ').substring(0, 500) + '...';
        
        // Create the prompt for content generation
        const question = `Write a detailed educational chapter of 500-800 words for Chapter ${chapterNo}: ${chapter} 
        of the book "${title}". Use HTML formatting with the following structure:
        
        <h1>Chapter ${chapterNo}: ${chapter}</h1>
        
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
        <p>Concluding paragraph here...</p>
        
        Here is the book summary for context: "${summaryText}"
        
        Make sure to:
        1. Follow the HTML structure exactly as shown above
        2. Create engaging, educational content that fits the book's theme and title
        3. Use proper HTML tags with no markdown
        4. Ensure the content flows naturally and is appropriate for the chapter's position in the book
        5. Make the chapter content consistent with the book's summary
        6. Include relevant examples and explanations
        
        Return only the formatted HTML content without any additional text, explanations, or code blocks.`;
        
        // Call OpenAI to generate the content
        const completion = await openAi.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system", 
                    content: "You are an expert content writer specializing in creating engaging, educational chapters for books and courses."
                },
                { 
                    role: "user", 
                    content: question
                }
            ],
            temperature: 0.9,
            max_tokens: 3000,
            top_p: 1,
        });

        // Extract and clean the response
        let chapterContent = completion.choices[0].message.content.trim();
        
        // Clean up the response - remove any code block markers or extra text
        chapterContent = chapterContent.replace(/```html|```/g, '').trim();
        
        // Check if the response starts with <h1> tag
        if (!chapterContent.startsWith('<h1>')) {
            const h1Start = chapterContent.indexOf('<h1>');
            if (h1Start >= 0) {
                chapterContent = chapterContent.substring(h1Start);
            } else {
                // If no h1 tag found, wrap in proper structure
                chapterContent = `<h1>Chapter ${chapterNo}: ${chapter}</h1>\n\n${chapterContent}`;
            }
        }
        
        // Check for required sections
        const requiredSections = ['Key Concepts', 'Main Topics', 'Summary'];
        let missingSections = [];
        
        for (const section of requiredSections) {
            if (!chapterContent.includes(`<h2>${section}</h2>`)) {
                missingSections.push(section);
            }
        }
        
        if (missingSections.length > 0) {
            console.warn(`Generated chapter content is missing required headings: ${missingSections.join(', ')}`);
        }
        
        return res.status(200).json({
            success: true,
            data: {
                content: chapterContent,
                chapterNo: chapterNo,
                chapter: chapter,
                title: title
            },
            message: 'Chapter content generated successfully'
        });
        
    } catch (error) {
        console.error('Error generating chapter content:', error);
        return res.status(500).json({
            success: false,
            message: 'Error generating chapter content',
            error: error.message
        });
    }
};


const addContentHandler = async (req, res) => {
    try {
        const { contentType } = req.params;
        const {  course_title, content, type = contentType } = req.body;

        const creator_id = req.user.userId
        
        // Validate required fields
        if ( !course_title || !content) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: creator_id, course_title, or content"
            });
        }
        
        // Create a new course/book entry
        const newContent = await Course.create({
            creator_id,
            course_title,
            content,
            // Use the contentType from URL parameter if type is not provided in request body
            type: contentType || type
        });
        
        return res.status(201).json({
            success: true,
            message: `${contentType} content added successfully`,
            data: newContent
        });
    } catch (error) {
        console.error("Error adding content:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error occurred while adding content",
            error: error.message
        });
    }
};

module.exports = {
    generateTitlesHandler,
    generateSummaryHandler,
    generateChapterContentHandler,
    addContentHandler
};