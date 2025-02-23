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
    const question = `Write a paragraph of 800-1200 words for chapter ${data.prompt.chapterNo} of the chapter ${data.prompt.chapter} for the Book title of mine = "${data.prompt.title}" for reference the summary is = ["${data.prompt.summary}"]....Make sure to return a markdown with headings bold italic and bullets....No extra text`;
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI response timed out")), 1800000) // 1800 sec (3 min)
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

module.exports = { createBookTitle,createBookSummary,createCompleteBook, getBookChapter};