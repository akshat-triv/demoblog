const User = require('../models/userModel');
const factory = require('./factoryController');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/sendMail');
const validator = require('validator');

exports.sendWelcome = catchAsync(async (req, res, next) => {
  const { email, name } = req.body;
  if (!validator.isEmail(email)) {
    return next(new AppError('Please enter a valid email', 404));
  }
  let tmp = {};
  tmp.email = email;
  tmp.name = name;
  await new sendEmail(
    tmp,
    'Welcome to <akshattrivedi>',
    "You'll be notified each time a new post comes in.",
    'https://www.linkedin.com/in/akshat-trivedi-18b8301a5/'
  ).welcome();
  next();
});

exports.getAllUsers = factory.getAll(User);

exports.createUser = factory.createOne(User);

exports.getUser = factory.getOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.updateUser = factory.updateOne(User);
