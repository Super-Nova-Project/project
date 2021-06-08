'use strict';
const mongoose = require('mongoose');


const quiz = new mongoose.Schema({
  quizTitle:{type: String, required: true, unique: true},
  quizText:{type: String, required: true},
  timer:{type: Number ,required: true},
  quizFile:{type: Buffer},
  solutionInfo:{type:Array}, //[{student:email , answers:{} , time:11}]
  students: { type: Array }
});


module.exports = mongoose.model('quiz', quiz);