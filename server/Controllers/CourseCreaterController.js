const courseModel = require('../Models/CourseModel');

const createCourse = async (req, res) => {
    try{
        const titles = await gptTitles(req.body);
       return res.status(200).json({ success: true, data: titles });
    }
    catch(err) {
        return res.status(500).json({ success: false, message: 'Error occurred while creating course', error: err.message });
    }
};

const gptTitles = async (data) => {
    const { prompt } = data;
    const response = await letsAi({ prompt });
    return response;
}



module.exports = { createCourse };
