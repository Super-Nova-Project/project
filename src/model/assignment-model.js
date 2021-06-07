'use strict';
const mongoose = require('mongoose');


const assignment = new mongoose.Schema({
  assignmentTitle:{type: String, required: true, unique: true},
  assignmentText:{type: String, required: true},
  due_date:{type: Date ,required: true},
  assignmentFile:{type: Buffer},
  solutionInfo:{type: Array}, // {student: email , solution: solutionText}
  students: { type: Array, required: true }
});


module.exports = mongoose.model('assignment', assignment);