const Course = require('../Models/CourseModel');
const axios = require('axios');
const cheerio = require('cheerio');
const letsAi = require('../Utils/gpt')

const createCourseTitle = async (req, res) => {
    try{
        const titles = await gptTitles(req.body);
       return res.status(200).json({ success: true, data: titles, message:'Titles Made Successfully' });
    }
    catch(err) {
        return res.status(500).json({ success: false, message: 'Error occurred while creating course', error: err.message });
    }
};

const createCourseSummary = async (req,res) => {
    try {
        const summary = await gptSummary(req.body);
        return res.status(200).json({success:true,data:summary,message:"Summary Made Successfully"});
    } catch (error) {
        return res.status(500).json({success:false, message:"Error occurred while creating course", error:error.message})
    }
}

const createCompleteCourse = async (req,res)=> {
    try {
        const body =req.body;
        const numberOfTitles = await getNumberOfTitles(body);
        const topicsArray = numberOfTitles.split("\n").map(item => item.trim());
        return res.status(200).json({success:true, message:"Titles returned successfully", data:topicsArray})
    } catch (error) {
        return res.status(500).json({success:false, message:"Error occurred while creating course", error:error.message})        
    }
}

const gptTitles = async (data) => {
    const question = `I am making a course of ${data.prompt}. Can you suggest me 10 titles? Make sure to return just the titles. No extra text`
    const response = await letsAi(question);
    if(response){
        const topicsArray = response
        .split('\n') // Split the string by new lines
        .map(item => item.replace(/^\d+\.\s/, '').trim());
        return topicsArray
    }
    // return response;
}

const gptSummary = async (data) => {
    const courseTitle = data.prompt || "Untitled Course";
    
    // Simplified prompt focused only on content
    const question = `Create a professional course summary for "${courseTitle}".

    IMPORTANT FORMATTING INSTRUCTIONS:
    1. You MUST provide EXACTLY 5 sections in the order listed below
    2. Each section must be separated by exactly three hyphens (---) on a line by themselves
    3. Do NOT include section titles, HTML tags, or any formatting
    4. Write 1-2 paragraphs (100-120 words) for each section
    5. STRICTLY follow this structure - any deviation will cause errors
    
    REQUIRED SECTIONS IN THIS EXACT ORDER:
    - Introduction section
    - Course Overview section
    - Key Benefits section
    - Target Audience section
    - Conclusion section
    
    YOUR RESPONSE MUST STRICTLY FOLLOW THIS STRUCTURE:
    [Introduction content here]
    ---
    [Course Overview content here]
    ---
    [Key Benefits content here]
    ---
    [Target Audience content here]
    ---
    [Conclusion content here]
    
    If you understand these requirements, proceed with creating the summary NOW. Include ONLY the content with the separators, nothing else.`;

    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI response timed out")), 60000) // 60 seconds
    );

    try {
        const response = await Promise.race([letsAi(question, 2048), timeout]);
        if (!response) return getDefaultSummary(courseTitle);
        
        // Split the response by the section separator
        const sections = response.split('---').map(section => section.trim());
        
        // Ensure we have exactly 5 sections, pad with defaults if needed
        const sectionTitles = ['Introduction', 'Course Overview', 'Key Benefits', 'Target Audience', 'Conclusion'];
        const defaultSections = [
            `Welcome to the course "${courseTitle}". This course will provide valuable insights and skills.`,
            `This course covers essential topics and practical applications in ${courseTitle}.`,
            `Students will gain improved understanding, practical skills, and confidence in the subject matter.`,
            `This course is designed for beginners to intermediate learners interested in ${courseTitle}.`,
            `By completing this course, you'll be equipped with the knowledge and skills needed to excel.`
        ];
        
        // Build the HTML with proper structure
        let html = '<div class="course-summary">';
        
        for (let i = 0; i < sectionTitles.length; i++) {
            const title = sectionTitles[i];
            // Use the AI-generated content or fall back to default if missing
            const content = sections[i] || defaultSections[i];
            
            html += `
  <h3 class="summary-section-title">${title}</h3>
  <p>${content}</p>
  `;
        }
        
        html += '</div>';
        
        return html;
    } catch (error) {
        console.error("Error generating summary:", error.message);
        return getDefaultSummary(courseTitle);
    }
};

// Helper function for default summary
function getDefaultSummary(courseTitle) {
    return `<div class="course-summary">
  <h3 class="summary-section-title">Introduction</h3>
  <p>Welcome to the course "${courseTitle}". This course will provide you with valuable insights and practical skills that you can apply immediately.</p>
  
  <h3 class="summary-section-title">Course Overview</h3>
  <p>This course covers essential topics and practical applications in ${courseTitle}, designed to build your knowledge step by step.</p>
  
  <h3 class="summary-section-title">Key Benefits</h3>
  <p>Students will gain improved understanding, practical skills, and confidence in applying concepts from ${courseTitle}.</p>
  
  <h3 class="summary-section-title">Target Audience</h3>
  <p>This course is designed for beginners to intermediate learners who are interested in expanding their knowledge in ${courseTitle}.</p>
  
  <h3 class="summary-section-title">Conclusion</h3>
  <p>By completing this course, you'll be equipped with the knowledge and skills needed to excel in ${courseTitle}.</p>
</div>`;
}

const getNumberOfTitles = async(data)=>{

    const question = `I want you to make ${data.prompt.numberOfChapters} chapters of this course title of mine = ${data.prompt.title}. Make sure to return just the titles of the chapters only. No Extra text`;
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI response timed out")), 30000) // 15 sec
    );
    try {
        const response = await Promise.race([letsAi(question), timeout]);
        if (!response ) return "Invalid AI response ";
        return response;
    } catch (error) {
        console.error("Error:", error.message);
        return error; // Rethrow for proper handling
    }

} 

const getCourseChapter = async (req, res) => {
    const data = req.body;
    const question = `Write a detailed educational chapter of 100-200 words for Chapter ${data.prompt.chapterNo}: ${data.prompt.chapter} 
    of the course "${data.prompt.title}". Use HTML formatting with the following structure:
    
    
    <div class="chapter-title"><h1>Chapter ${data.prompt.chapter}</h1></div>
    
    <div class="chapter-content">
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
    </div>
    Make sure to use proper HTML tags and return only the formatted HTML content without any markdown.`;

    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI response timed out")), 1800000)
    );    

    try {
        const response = await Promise.race([letsAi(question, 4096), timeout]);
        if (!response) {
            console.error("Invalid AI response for chapter:", data.prompt.chapterNo);
            return res.status(500).json({ success: false, message: "Invalid AI response" });
        }
        return res.status(200).json({ success: true, data: response, message: "Chapter created successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ success: false, message: "Error occurred while creating chapter", error: error.message });
    }
};

const getCourses = async (req, res) => {
  try {
      const { type } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Get the user ID from the authentication middleware
      const userId = req.user.userId;
      
      // let whereClause = {
      //     creator_id: userId // Add the creator_id condition
      // };

      let whereClause = {
        creator_id:userId
      }
      
      // Add the type condition if provided
      if (type === 'course' || type === 'book') {
          whereClause.type = type;
      }
      
      // Get courses with pagination
      const { count, rows: courses } = await Course.findAndCountAll({
          where: whereClause,
          order: [['createdAt', 'DESC']],
          offset: offset,
          limit: limit
      });
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(count / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      return res.status(200).json({ 
          success: true, 
          message: 'Fetch Data Successfully', 
          data: courses,
          pagination: {
              totalItems: count,
              totalPages: totalPages,
              currentPage: page,
              itemsPerPage: limit,
              hasNextPage: hasNextPage,
              hasPrevPage: hasPrevPage
          }
      });
  } catch (error) {
      return res.status(500).json({ 
          success: false, 
          message: "Error occurred while fetching courses", 
          error: error.message 
      });
  }
};


const addCourse = async (req, res) => {
    try {
        const {type} = req.params;
        const body = {
            ...req.body,
            type:type
        };
        const course = new Course(body);
        const savedCourse = await course.save();;
        return res.status(201).json({ success: true, data: savedCourse, message:" Course "+savedCourse.course_id+" saved successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Error occurred while adding course", error: error.message });
    }
}

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findOne({
            where: { course_id: req.params.id }
        });
        return res.status(200).json({ success: true, data: course, message: "Course fetched successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error occurred while fetching course", error: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { courseTitle, content, courseType, pdfLocation, blobLocation, coverLocation, quizLocation } = req.body;

        const updatedCourse = await Course.update(
            {
                course_title: courseTitle,
                content: content,
                type: courseType,
                pdf_location: pdfLocation,
                blob_location: blobLocation,
                cover_location: coverLocation,
                quiz_location: quizLocation
            },
            {
                where: { course_id: req.params.id }
            }
        );

        if (updatedCourse[0] === 0) {
            return res.status(404).json({ success: false, message: "Course not found or no changes applied" });
        }
        const course = await Course.findOne({
            where: { course_id: req.params.id }
        });
        return res.status(200).json({ success: true, message: "Course updated successfully" , data: course});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error occurred while updating course", error: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        // Delete the course
        const deletedRows = await Course.destroy({
            where: { course_id: req.params.id }
        });

        // Check if the course exists and was deleted
        if (deletedRows === 0) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Optionally check if the course is actually deleted by querying the database
        const checkcourse = await Course.findOne({
            where: { course_id: req.params.id }
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Course deleted successfully', 
            data: { deleted: true }, 
            check: checkcourse 
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Error occurred while deleting course", 
            error: error.message 
        });
    }
};

const convertBlobToChapters = async (req, res) => {
    try {
      const { blobUrl } = req.body;
  
      if (!blobUrl) {
        return res.status(400).json({
          success: false,
          message: 'Blob URL is required'
        });
      }
  
      // Fetch the HTML content from the blob URL
      const response = await axios.get(blobUrl);
      const htmlContent = response.data;
  
      // Parse the HTML content
      const $ = cheerio.load(htmlContent);
      const chapters = [];
  
      // Find all chapter-title divs
      $('.chapter-title').each((index, element) => {
        // First try to get the data-title attribute
        const dataTitle = $(element).attr('data-title');
        // If data-title exists, use it, otherwise use the text content
        const title = dataTitle || $(element).text().trim();
        
        // Find the corresponding chapter-content div
        // This assumes chapter-content follows chapter-title in the DOM
        const contentDiv = $(element).next('.chapter-content');
        let content = contentDiv.html() || '';
        
        // Clean up the content by removing extra slashes
        content = content.replace(/\\/g, '');
  
        chapters.push({
          title,
          content
        });
      });
  
      if (chapters.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No chapters found in the blob content'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: {
          chapters
        }
      });
  
    } catch (error) {
      console.error('Error converting blob to chapters:', error);
      return res.status(500).json({
        success: false,
        message: 'Error converting blob to chapters',
        error: error.message
      });
    }
  };

const convertExternalQuiz = async (req, res) => {
  try {
    const { quizUrl } = req.body;
    const courseId = quizUrl.match(/\/quiz\/(\d+)\//)?.[1];



    // Fetch the quiz data from the external URL
    const response = await axios.get(quizUrl);
    const courseData = response.data;

    // Get the current course content
    const course = await Course.findOne({
      where: { course_id: courseId }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Parse the current course content
    let courseContent = [];
    try {
      courseContent = JSON.parse(course.content);
      if (typeof courseContent === 'string') {
        courseContent = JSON.parse(courseContent);
      }
    } catch (e) {
      console.error("Error parsing course content:", e);
      return res.status(500).json({
        success: false,
        message: 'Error parsing course content'
      });
    }

   
    const chaptersArray = Object.entries(courseData.courseChapters).map(([key, value]) => ({
        id: key, // you can name it `id`, `slug`, etc.
        ...value,
      }));
    chaptersArray.map((item,index)=>{
        // if(item.quiz){
            courseContent[index].quiz = item.quizContents   
        // }
    })
 
 
    // Update the course with the new content
    const updatedCourse = await Course.update(
      {
        content: JSON.stringify(courseContent)
      },
      {
        where: { course_id: courseId }
      }
    );

    if (updatedCourse[0] === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update course with quiz content'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Quiz content added to course successfully',
      data: courseContent
    });

  } catch (error) {
    console.error('Error converting external quiz:', error);
    return res.status(500).json({
      success: false,
      message: 'Error converting external quiz',
      error: error.message
    });
  }
};

module.exports = { createCourseTitle,createCourseSummary,createCompleteCourse, getCourseChapter, 
                addCourse, getCourses, getCourseById, updateCourse, deleteCourse,convertBlobToChapters, convertExternalQuiz };