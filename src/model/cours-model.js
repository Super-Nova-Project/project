'use strict';
const mongoose = require('mongoose');


const course = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  assignments: { type: Array, required: true },
  quizes: { type: Array, required: true },
  members: { type: Array, required: true },
  owner: { type: String, required: true },
  description: { type: String, required: true },
  grades: { type: Array, required: true }
});


module.exports = mongoose.model('course', course);