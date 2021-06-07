'use strict';

const express = require('express');
const courseRouter = express.Router();
const bearerAuth = require('../middleware/bearer.js'); 
const getCourseData = require('../middleware/getCourseData.js');
const permission = require('../middleware/permission.js');
const mongooseCourse = require('../model/cours-model.js');
const mongooseAssignment = require('../model/assignment-model.js')
const mongooseQuiz = require('../model/quiz-model.js');

courseRouter.post('/course/:courseID/create-assignment' ,bearerAuth, getCourseData, permission , async (req,res)=>{
  const thisCourse = req.course;
  const assignmet = new mongooseAssignment(req.body);
  thisCourse.assignments.push(assignmet);
  const myCourse = await mongooseCourse.findByIdAndUpdate(thisCourse._id , thisCourse , {new:true});
  console.log('this:' , thisCourse);
  console.log('db :' , myCourse);
  res.send(myCourse);
});

courseRouter.post('/course/:courseID/create-quiz' , bearerAuth , getCourseData, permission , async (req,res) =>{
  const thisCourse = req.course;
  const quiz = new mongooseQuiz(req.body);
  console.log(quiz);
  thisCourse.quizes.push(quiz);
  const myCourse = await mongooseCourse.findByIdAndUpdate(thisCourse._id , thisCourse , {new:true});
  console.log('this:' , thisCourse);
  console.log('db :' , myCourse);
  res.send(myCourse);
});


courseRouter.get('/course/all-courses', bearerAuth , async (req,res) =>{
  const allCourses = await mongooseCourse.find({});
  res.send(allCourses);
});
courseRouter.get('/course/:courseID/grades', bearerAuth, getCourseData, permission, (req, res) => {

  // let courseID = req.params.courseID;
  console.log('------------hi------------', req.course);
  res.status(200).json(req.course.grades)

})
courseRouter.post('/course/:courseID/grades',bearerAuth,getCourseData, permission, async (req, res) => {
  try {
      const id = req.params.courseID;
      const email = req.user.email;
      const myCourse = await mongooseCourse.findById(id);
      if (!myCourse.members.includes(email)) next('you are not enrolled in this course')
      if (myCourse) {
          
          myCourse.grades.forEach(element => {
              if(element.email == email) element = req.body;
          });
          await myCourse.save()
          res.status(201).json(myCourse);
      } else {
          next('course not found')
      }
  } catch (err) {
      res.status(401).json(err)
  }
})
courseRouter.post('/create-course', bearerAuth, async (req, res) => {
  req.body.owner = req.user.email
  req.body.members = [];
  req.body.members.push(req.user.email)
  let course = new mongooseCourse(req.body);
  const newCourse = await course.save();
  res.status(201).json(newCourse);
})
courseRouter.post('/join-course', bearerAuth, async (req, res, next) => {
  let id = req.body.id;
  const email = req.user.email;
  const myCourse = await mongooseCourse.findById(id);
  if (myCourse.members.includes(email)) next('you are already enrolled')
  if (myCourse) {
      let obj = {
          email: email,
          midExam: 0,
          firstExam: 0,
          secondExam: 0,
          quizOne: 0,
          quizTwo: 0,
          quizThree: 0,
          finalExam: 0,
          overAll: 0
      }
      myCourse.members.push(email);
      myCourse.grades.push(obj);
      await myCourse.save()
      res.status(201).json(myCourse);
  } else {
      next('course not found')
  }
})
module.exports = courseRouter;