// const { default: OpenAI } = require('openai');
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

/**
 * Generate a comprehensive summary for onboarding content with expanded options
 * @param {Object} req - Request object with content details
 * @param {Object} res - Response object
 */
const generateSummaryHandler = async (req, res) => {
    try {
        const { contentType, contentCategory, contentTitle, contentDetails } = req.body;

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


const chapterCount = Math.floor(Math.random() * 6) + 10; // Random number between 10-15
        
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
8. Return ONLY the numbered list of titles without any additional text.

Format your response as follows:
1. [First Chapter Title]
2. [Second Chapter Title]
...and so on.`;

        // Call OpenAI API to generate the summary
        const [summaryResponse, chapterTitlesResponse] = await Promise.all([
            openAi.chat.completions.create({
                model: "gpt-4-turbo",
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
                max_tokens: 2000
            }),
            
            openAi.chat.completions.create({
                model: "gpt-4-turbo",
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
            })
        ]);

        // Extract and validate the response
        const summaryContent = summaryResponse.choices[0].message.content.trim();
        
        // Check if all required sections are present
        const requiredHeadings = ['Introduction', 'Overview', 'Key Topics', 'Main Content Sections', 'Learning Outcomes', 'Target Readers'];
        
        let missingHeadings = [];
        for (const heading of requiredHeadings) {
            if (!summaryContent.includes(`<h2>${heading}</h2>`)) {
                missingHeadings.push(heading);
            }
        }
        
        if (missingHeadings.length > 0) {
            console.warn(`Generated summary is missing required headings: ${missingHeadings.join(', ')}`);
        }

        // Process chapter titles
        const rawChapterTitles = chapterTitlesResponse.choices[0].message.content.trim();
        
        // Parse the numbered list into an array of titles
        const chapterTitles = [];
        const titleMatches = rawChapterTitles.match(/\d+\.\s+(.+)(?:\r?\n|$)/g) || [];
        
        for (const match of titleMatches) {
            const title = match.replace(/^\d+\.\s+/, '').trim();
            if (title) chapterTitles.push(title);
        }
        
        // Ensure we have the correct number of chapter titles
        if (chapterTitles.length < 10) {
            console.warn(`Expected at least 10 chapter titles, but only ${chapterTitles.length} were generated.`);
        }

        // Return both the summary and chapter titles
        return res.status(200).json({
            success: true,
            data: {
                summary: summaryContent,
                chapterTitles: chapterTitles,
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
            message: 'Summary and chapter titles generated successfully'
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

module.exports = {
    generateTitlesHandler,
    generateSummaryHandler,
};