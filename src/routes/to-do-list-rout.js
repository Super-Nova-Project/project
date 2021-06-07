// require express for setting up the express server
const express = require('express');
const mongoosetask = require('../model/task');
const mongooseAssignment = require('../model/assignment-model.js')
const User = require('../model/users-model');
const mongooseCourse = require('../model/cours-model.js');

const taskRouter = express.Router();


// get the tasks or the assignment or the quiz form the couse schema upon the couse id 
taskRouter.get('/task', bearerAuth , async (req, res)=>{

    const id = 0;
    todotask = [];
    User.userCourses.forEach(usercourse =>{
       id = usercourse;
      const taskfromschema =  await mongooseCourse.findById(id);
      const assignment = taskfromschema.assignments.filter(x => !x.students.includes(req.User.email));
      const quize = taskfromschema.quizes.filter(x => !x.students.includes(req.User.email));
      todotask.push(...assignment);
      todotask.push(...quize);
    });    
    res.send(todotask);
});



module.exports = taskRouter;