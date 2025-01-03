const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  rollNumber: String,
  picture: String 
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
