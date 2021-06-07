'use strict';
const mongoose = require('mongoose');


const assignment = new mongoose.Schema({
  assignmentTitle:{type: String, required: true, unique: true},
  assignmentText:{type: String, required: true},
  due_date:{type: Date ,required: true},
  assignmentFile:{type: Buffer}
  
});


module.exports = mongoose.model('assignment', assignment);