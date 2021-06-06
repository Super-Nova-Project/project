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
module.exports = courseRouter;