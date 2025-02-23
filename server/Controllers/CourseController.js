const Course = require('../Models/CourseModel');

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
    const question = `I am making a course of ${data.prompt}. Can you write me a summary of 600 words? Make sure to return the summary only`;
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
    const question = `Write a paragraph of 800-1200 words for chapter ${data.prompt.chapterNo} of the chapter ${data.prompt.chapter} for the course title of mine = "${data.prompt.title}" for reference the summary is = ["${data.prompt.summary}"].....Make sure to return a markdown with headings bold italic and bullets....No extra text`;
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

const getCourses = async (req, res) => {
    try {
        const { type } = req.params;
        let courses;

        if (type === 'course' || type === 'book') {
            courses = await Course.findAll({
                where: { type: type },
                order: [['createdAt', 'DESC']] // Sort by latest courses first
            });
        } else {
            courses = await Course.findAll({
                order: [['createdAt', 'DESC']] // Sort by latest courses first
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Fetch Data Successfully', 
            data: courses 
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

module.exports = { createCourseTitle,createCourseSummary,createCompleteCourse, getCourseChapter, 
                addCourse, getCourses, getCourseById, updateCourse, deleteCourse };