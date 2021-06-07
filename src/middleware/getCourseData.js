const courseData = require('../model/cours-model')

module.exports = async (req, res, next)=>{
    let courseID = req.params.courseID;
    const course = await courseData.findById(courseID);
    if(course){
        if (course.members.includes(req.user.email)) {
            
            req.course = course;
            next();
        }else{
            next('you are not joined to this course')
        }
    }else{
        next('course ID is not correct');
    }
}