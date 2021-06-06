'use strict';

const express = require('express');
const courseRouter = express.Router();
const bearerAuth = require('../middleware/bearer.js'); 
const Course = require('../model/cours-model.js');

courseRouter.post('/course/:courseID/create-assignment' ,bearerAuth, (req,res)=>{
  console.log(req.params.courseID);
  console.log(req.body);
  res.send('done');
});

courseRouter.post('/course/:courseID/create-quiz' , bearerAuth ,(req , res) =>{
  res.send('done');
})
module.exports = courseRouter;