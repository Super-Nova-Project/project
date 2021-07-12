// require express for setting up the express server
const express = require('express');
// const mongoosetask = require('../model/task');
const mongooseAssignment = require('../model/assignment-model.js')
const User = require('../model/users-model');
const mongooseCourse = require('../model/cours-model.js');
const bearerAuth = require('../middleware/bearer')

const taskRouter = express.Router();


// get the tasks or the assignment or the quiz form the couse schema upon the couse id 
taskRouter.get('/task', bearerAuth , async (req, res)=>{

    const id = 0;
    const todotask = [];
    const theUser = await User.findById(req.user._id);
    // console.log('theUser----------------',theUser);
    const myarr = theUser.userCourses;
    // console.log('myarr----------------',myarr);
    for (let id of myarr){
       console.log('id------------', id);
      const taskfromschema =  await mongooseCourse.findById(id.id);
      if (taskfromschema.owner != req.user.email) {
        
        let assignment = taskfromschema.assignments.filter(x => !x.students.includes(req.user.email));
        let quize = taskfromschema.quizes.filter(x => !x.students.includes(req.user.email));
        todotask.push(...assignment);
        todotask.push(...quize);
      }
    }    
    res.send(todotask);
});



module.exports = taskRouter;