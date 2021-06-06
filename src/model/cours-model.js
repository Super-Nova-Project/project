'use strict';
const mongoose = require('mongoose');


const course = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  assignments: { type: Array, required: false },
  quizes: { type: Array, required: false },
  members: { type: Array, required: true },
  owner: { type: String, required: true },
  description: { type: String, required: true },
  grades: { type: Array, required: false }
});


module.exports = mongoose.model('course', course);