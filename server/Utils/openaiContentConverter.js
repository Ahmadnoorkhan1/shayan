const axios = require('axios');
const Course = require('../Models/CourseModel');
const fs = require('fs-extra');
const path = require('path');
const OpenAI = require('openai');

const openAi = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
});

/**
 * Converts blob HTML content to structured chapters using OpenAI
 */
async function convertBlobToStructuredContentWithAI(courseId) {
  try {
    console.log(`Starting OpenAI-powered conversion for course ID: ${courseId}`);
    
    // 1. Fetch the course from database
    const course = await Course.findOne({
      where: { course_id: courseId }
    });
    
    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }
    
    console.log(`Found course: ${course.course_title}`);
    
    if (!course.blob_location) {
      throw new Error(`Course ${courseId} does not have a blob location`);
    }
    
    // 2. Get the HTML content from the blob
    let htmlContent;
    
    // Handle both absolute and relative URLs
    if (course.blob_location.startsWith('http')) {
      console.log(`Fetching content from URL: ${course.blob_location}`);
      const response = await axios.get(course.blob_location);
      htmlContent = response.data;
    } else {
      // For relative paths
      const baseDir = path.resolve(__dirname, '../public');
      const filePath = path.join(baseDir, course.blob_location.replace(/^\//, ''));
      
      try {
        console.log(`Reading content from file: ${filePath}`);
        htmlContent = await fs.readFile(filePath, 'utf8');
      } catch (fileError) {
        // Try with domain prefixed
        const domainPath = `https://minilessonsacademy.com${course.blob_location}`;
        console.log(`File not found locally. Trying URL: ${domainPath}`);
        
        try {
          const response = await axios.get(domainPath);
          htmlContent = response.data;
        } catch (urlError) {
          throw new Error(`Could not retrieve content from file or URL: ${fileError.message}, ${urlError?.message}`);
        }
      }
    }
    
    // 3. Use OpenAI to analyze and restructure the entire content
    console.log("Sending content to OpenAI for restructuring...");
    
    const promptText = `
You are an expert at organizing educational content.

I have a course/book HTML content that needs to be structured into proper chapters. The content is from a course titled "${course.course_title}".

TASK:
1. Analyze the HTML content 
2. Identify the natural chapter divisions (looking for headings, sections, etc.)
3. Reorganize it into well-structured chapters

Each chapter should follow EXACTLY this HTML structure:
<h1>Chapter [number]: [chapter title]</h1>

<p>[Introduction paragraph - 2-3 sentences introducing the chapter topic]</p>

<h2>Key Concepts</h2>
<p>[1-2 paragraphs explaining the key concepts of this chapter]</p>

<h2>Main Topics</h2>
<p>[1 paragraph describing the main topics with <strong>important terms in bold</strong> and <em>special terms in italics</em>]</p>

<ul>
  <li>[First key point about the topic]</li>
  <li>[Second key point about the topic]</li>
  <li>[Third key point about the topic]</li>
</ul>

<h2>Summary</h2>
<p>[1 paragraph summarizing the chapter content and its importance]</p>

IMPORTANT INSTRUCTIONS:
- Format each chapter content WITH PROPER HTML
- Do not escape HTML tags or add unnecessary backslashes
- The "chapter" field should only contain the title WITHOUT the chapter number prefix
- Make sure chapter numbers start at 1 and increment sequentially

FORMAT YOUR RESPONSE AS A JSON ARRAY OF CHAPTER OBJECTS:
[
  {
    "chapterNo": 1,
    "chapter": "Basics of Bookkeeping",
    "content": "<h1>Chapter 1: Basics of Bookkeeping</h1>\\n<p>Introduction text...</p>\\n<h2>Key Concepts</h2>..."
  },
  {
    "chapterNo": 2, 
    "chapter": "Financial Transactions",
    "content": "<h1>Chapter 2: Financial Transactions</h1>\\n<p>Introduction text...</p>..."
  }
]

Here's the HTML content to analyze and restructure:
${htmlContent.substring(0, 15000)} // Truncate for token limits
    `;
    
    const completion = await openAi.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You're an expert at analyzing educational content and restructuring it into well-organized chapters. Return valid JSON with HTML content in the specified format." 
        },
        { 
          role: "user", 
          content: promptText 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });
    
    // Parse the response JSON
    const responseContent = completion.choices[0].message.content.trim();
    let chaptersArray;
    
    try {
      console.log("Processing AI response...");
      
      // Parse JSON response
      const parsedResponse = JSON.parse(responseContent);
      
      // Extract chapters array
      if (Array.isArray(parsedResponse)) {
        chaptersArray = parsedResponse;
      } else if (parsedResponse.chapters && Array.isArray(parsedResponse.chapters)) {
        chaptersArray = parsedResponse.chapters;
      } else {
        throw new Error("Response format is not an array of chapters");
      }
      
      // Clean up chapter objects
      chaptersArray = chaptersArray.map(chapter => {
        // Strip any "Chapter X: " prefix from the chapter title
        const chapterTitle = (chapter.chapter || "").replace(/^Chapter\s+\d+\s*:\s*/i, "").trim();
        
        // Clean HTML content - remove escaped characters
        const cleanContent = (chapter.content || "")
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\');
        
        return cleanContent;
        
      });
      
      // Debug the final structure
      console.log("Processed chapters structure:", 
        JSON.stringify(chaptersArray.map(c => ({ 
          chapterNo: c.chapterNo, 
          chapter: c.chapter,
          contentLength: c.content?.length || 0
        }))));
      
    } catch (jsonError) {
      console.error("Error processing AI response:", jsonError);
      console.error("Response content:", responseContent.substring(0, 500) + "...");
      throw new Error(`Failed to process AI-generated chapter structure: ${jsonError.message}`);
    }
    
    // Check if we got valid chapters
    if (!Array.isArray(chaptersArray) || chaptersArray.length === 0) {
      throw new Error("OpenAI did not return valid chapter content");
    }
    
    console.log(`Generated ${chaptersArray.length} structured chapters`);
    
    // 4. Update the course with the structured content
    console.log(`Updating course ${courseId} with AI-restructured chapters`);
    
    // Update the course with properly structured content
    await Course.update(
      { 
        content: chaptersArray,
        blob_location_original: course.blob_location
      },
      { where: { course_id: courseId } }
    );
    
    console.log('AI-powered conversion completed successfully!');
    return {
      success: true,
      message: `Successfully converted blob content to structured format for course ID: ${courseId}`,
      chaptersConverted: chaptersArray.length,
      course: {
        id: course.course_id,
        title: course.course_title
      }
    };
  } catch (error) {
    console.error('AI conversion failed:', error);
    return {
      success: false,
      message: `Error during AI conversion: ${error.message}`,
      error: error
    };
  }
}

module.exports = { convertBlobToStructuredContentWithAI };