const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'User must provide an email'],
    validate: [validator.isEmail, 'Please enter a valid email'],
    unique: [true, 'We know this email already'],
  },
  name: {
    type: String,
    required: [true, 'User must provide his name'],
  },
  user_id: {
    type: String,
    required: [true, 'A user must have a user id'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
