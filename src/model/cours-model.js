'use strict';
const mongoose = require('mongoose');


const course = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  assignment: { type: Array, required: true },
  quiz: { type: Array, required: true },
  member: { type: Array, required: true },
  owner: { type: String, required: true },
  description: { type: String, required: true }

});


module.exports = mongoose.model('course', course);