'use strict';
const mongoose = require('mongoose');


const quiz = new mongoose.Schema({
  quizTitle:{type: String, required: true, unique: true},
  quizText:{type: String, required: true},
  timer:{type: Number ,required: true},
  quizFile:{type: Buffer}
});


module.exports = mongoose.model('quiz', quiz);