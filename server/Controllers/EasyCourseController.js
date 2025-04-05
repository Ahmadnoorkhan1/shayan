// const Course = require('../Models/CourseModel');

const letsAi = require('../Utils/gpt')

const createCourseTitle = async (req, res) => {
    try {
        const titles = await gptTitles(req.body);
        return res.status(200).json({ success: true, data: titles, message: 'Titles Made Successfully' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Error occurred while creating course', error: err.message });
    }
};

const createCompleteCourse = async (req, res) => {
    try {
        // const completeCourse = await gptChapters(req.body);
        // console.log('CreateCompleteCourse',completeCourse)
        const body = req.body;
        const numberOfTitles = await getNumberOfTitles(body);
        const topicsArray = numberOfTitles.split("\n").map(item => item.trim());

        return res.status(200).json({ success: true, message: "Titles returned successfully", data: topicsArray })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error occurred while creating course", error: error.message })
    }
}

const gptTitles = async () => {
    const question = `Can you suggest me 10 most commonly searched random topics random make sure all are different for Courses? Make sure to return just the topics. No extra text`
    const response = await letsAi(question);
    if (response) {
        const topicsArray = response
            .split('\n') // Split the string by new lines
            .map(item => item.replace(/^\d+\.\s/, '').trim());
        return topicsArray
    }
    // return response;
}

const getNumberOfTitles = async (data) => {

    const question = `I want you to make ${data.prompt.numberOfChapters} chapters of this course title of mine = ${data.prompt.title}. Make sure to return just the titles of the chapters only. No Extra text`;
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI response timed out")), 30000) // 15 sec
    );

    try {
        const response = await Promise.race([letsAi(question), timeout]);
        if (!response) return "Invalid AI response ";

        return response;
    } catch (error) {
        console.error("Error:", error.message);
        return error; // Rethrow for proper handling
    }

}

const getCourseChapter = async (req, res) => {
    const data = req.body;
    const rules = "[Overall Rules to follow] 1) Please generate a detailed educational chapter based on the topic provided, using Markdown for formatting. 2) The content should be expansive and educational, akin to a textbook chapter written by an educator. 3) Aim for a narrative that flows organically. Use Markdown headings for section titles but avoid using subpoints, numbering, or bullet points within sections. 4) The chapter should delve deeply into explanations and examples, aspiring to include at least 1500 words of content. 5) Focus on making the material engaging, informative, and easily parsable, with a natural progression of ideas and topics, using Markdown to structure the document. 6) Remember, the goal is to enlighten and educate in a manner that's both thorough and accessible, encouraging a deeper understanding of the subject. [Markdown Formatting Guide] - Use '#' for main section titles, '##' for subsection titles. - Separate paragraphs with a blank line. - Emphasize key terms using asterisks (e.g., '*italics*'' or '**bold**'). - Do not use numbered or bulleted lists for subpoints within sections. [Example of what an output should look like in Markdown:] # Introduction to Power Tools Woodworking is a craft that has been practiced for centuries. From hand tools to power tools, the evolution of woodworking has brought about increased efficiency and precision in creating beautiful and functional pieces of furniture, structures, and decorative items. Power tools, in particular, have revolutionized the way woodworkers approach their craft. ... # Conclusion Power tools have revolutionized the field of woodworking, enabling woodworkers to work with increased efficiency, precision, and versatility. This chapter provided an overview of some of the most commonly used power tools in woodworking, including circular saws, table saws, miter saws, routers, jigsaws, and drill presses. It emphasized the importance of safety when using power tools and introduced the different functions and features of each tool. In the next section, we will delve deeper into each power tool, exploring their specific applications, features, and techniques for safe and effective use in woodworking projects. [End Example of what output should look like] Only include content regarding woodworking or powertools if that is actually what the course the user is creating is about, woodworking was only an example to show you what kind of response to generate"
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
    
    Make sure to use proper HTML tags and return only the formatted HTML content without any markdown.`;    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI response timed out")), 1800000) // 1800 sec (3 min)
    );
    try {
        const response = await Promise.race([letsAi(question, 4096, rules), timeout]);
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

module.exports = { createCourseTitle, createCompleteCourse, getCourseChapter };