const courseData = require('../model/cours-model')

module.exports = async (req, res, next)=>{
    const course = await courseData.findById(courseID);
    if(course){
        req.course = course;
        next();
    }else{
        next('course ID is not correct');
    }
}