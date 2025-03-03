const Course = require('../Models/CourseModel');
const letsAi = require('../Utils/gpt')

const createBookTitle = async (req, res) => {
    try{
        const titles = await gptTitles(req.body);
       return res.status(200).json({ success: true, data: titles, message:'Titles Made Successfully' });
    }
    catch(err) {
        return res.status(500).json({ success: false, message: 'Error occurred while creating Book', error: err.message });
    }
};

const createBookSummary = async (req,res) => {
    try {
        const summary = await gptSummary(req.body);
        return res.status(200).json({success:true,data:summary,message:"Summary Made Successfully"});
    } catch (error) {
        return res.status(500).json({success:false, message:"Error occurred while creating Book", error:error.message})
    }
}

const createCompleteBook = async (req,res)=> {
    try {
        // const completeBook = await gptChapters(req.body);
        // console.log('CreateCompleteBook',completeBook)
        const body =req.body;
        // console.log('CreateCompleteBook!!!!!!!!!!!!!! WHY',body)
        const numberOfTitles = await getNumberOfTitles(body);
        const topicsArray = numberOfTitles.split("\n").map(item => item.trim());
        return res.status(200).json({success:true, message:"Titles returned successfully", data:topicsArray})
    } catch (error) {
        return res.status(500).json({success:false, message:"Error occurred while creating Book", error:error.message})        
    }
}

const gptTitles = async (data) => {
    const question = `I am making a Book of ${data.prompt}. Can you suggest me 10 titles? Make sure to return just the titles. No extra text`
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
    const question = `I am making a Book of ${data.prompt}. Can you write me a summary of 600 words? Make sure to return the summary only`;
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI response timed out")), 30000) // 15 sec
    );

    try {
        const response = await Promise.race([letsAi(question), timeout]);
        if (!response ) return "Invalid AI response";
        
        return response;
    } catch (error) {
        console.error("Error:", error.message);
        return error; // Rethrow for proper handling
    }
};

const getNumberOfTitles = async(data)=>{

    const question = `I want you to make ${data.prompt.numberOfChapters} chapters of this Book title of mine = ${data.prompt.title}. Make sure to return just the titles of the chapters only. No Extra text`;
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

const getBookChapter = async (req, res) => {
    const data = req.body;
    const question = `Write a detailed educational chapter of 100-200 words for Chapter ${data.prompt.chapterNo}: ${data.prompt.chapter} 
    of the book "${data.prompt.title}". Use HTML formatting with the following structure:
    
    <h1>Chapter ${data.prompt.chapterNo}: ${data.prompt.chapter}</h1>
    
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



const getBookById = async (req, res) => {
    try {
        const course = await Course.findOne({
            where: { course_id: req.params.id, type: 'book' },
        });
        return res.status(200).json({ success: true, data: course, message: "Course fetched successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error occurred while fetching course", error: error.message });
    }
};
module.exports = { createBookTitle,createBookSummary,createCompleteBook, getBookChapter , getBookById};