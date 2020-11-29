const JWT = require('jsonwebtoken');
const { promisify } = require('util');
const Admin = require('./../models/adminModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/sendMail');
const crypto = require('crypto');

async function createToken(obj) {
  const token = await JWT.sign(obj, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  return token;
}

function sendToken(token, status, message, res) {
  res.cookie('JWT', token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  });
  res.status(status).json({ token, message });
}

exports.securityCheck = catchAsync(async (req, res, next) => {
  const { secret } = req.body;
  if (!secret || secret != process.env.JWT_SECRET) {
    return next(new AppError('You are not authorized for this route', 403));
  }
  req.body.secret = undefined;
  next();
});

exports.signup = catchAsync(async (req, res, next) => {
  const obj = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };

  const user = await Admin.create(obj);

  const token = await createToken({ id: user.id });

  sendToken(token, 201, 'Sign up was successful', res);
});

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new AppError('Please provide your email and password', 400));
  }
  const user = await Admin.findOne({ email: req.body.email }).select(
    '+password'
  );
  //console.log(user);
  if (!user) {
    return next(new AppError('User does not exists', 400));
  }

  if (!(await user.checkPassword(req.body.password, user.password))) {
    return next(new AppError('email or password is incorrect', 401));
  }

  const token = await createToken({ id: user.id });

  sendToken(token, 200, 'Login was successful', res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) get the token
  let token;

  if (req.cookies.JWT) {
    token = req.cookies.JWT;
  } else if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are authorized to access this route', 401));
  }
  //2) get the user from the token

  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  const user = await Admin.findById(decoded.id);

  if (!token || !user) {
    return next(new AppError('No such user exists', 401));
  }

  //3) check if the password been changed after the token was issued
  if (!(await user.checkToken(decoded, user))) {
    return next(
      new AppError(
        'Your password was changed recently. Please login again',
        401
      )
    );
  }
  req.user = user;
  next();
});

exports.fogotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;

  const user = await Admin.findOne({ email });

  if (!user) {
    return next(new AppError('User does not exist', 404));
  }

  const resetToken = await user.createReset();
  await user.save({ validateBeforeSave: false });

  const resetLink = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/admin/resetPassword/${resetToken}`;

  const message = `Your password reset link: ${resetLink} It will expire in 10 minutes`;

  await new sendEmail(
    user,
    'Password reset link',
    message,
    resetLink
  ).forgotPassword();

  res.status(200).json({
    status: 'success',
    message: 'Reset link has been set to the requested email',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  let resetToken = req.params.resetToken;

  let { password, passwordConfirm } = req.body;

  resetToken = await crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await Admin.findOne({
    passwordResetToken: resetToken,
    passwordResetDate: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError('User does not exist or Password link has been expired', 404)
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetDate = undefined;
  user.passwordResetToken = undefined;

  await user.save();

  const token = await createToken({ id: user.id });

  sendToken(token, 200, 'Password changed successfully', res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  let { password, passwordConfirm, passwordCurrent } = req.body;

  if (!passwordConfirm || !passwordCurrent || !password) {
    return next(new AppError('Please send all required data', 400));
  }

  const user = await Admin.findById(req.user.id).select('+password');

  if (!(await user.checkPassword(passwordCurrent, user.password))) {
    return next(new AppError('Current Password is not correct', 402));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  const token = await createToken({ id: user.id });

  sendToken(token, 200, 'Password changed successfully', res);
});
