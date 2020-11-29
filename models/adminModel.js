const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('validator');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photo: String,
  role: {
    type: String,
    default: 'admin',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm your password please'],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'Passwords does not match',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetDate: {
    type: Date,
  },
});

adminSchema.methods.createReset = async function () {
  const resetString = await crypto.randomBytes(32).toString('hex');
  const encryptedReset = await crypto
    .createHash('sha256')
    .update(resetString)
    .digest('hex');

  this.passwordResetToken = encryptedReset;
  this.passwordResetDate = Date.now() + 10 * 60 * 1000;

  return resetString;
};

adminSchema.methods.checkPassword = async function (sentPass, userPass) {
  const result = await bcrypt.compare(sentPass, userPass);

  return result;
};

adminSchema.methods.checkToken = async function (token, user) {
  const passChanged = new Date(user.passwordChangedAt).getTime() / 1000;

  //console.log(token.iat, passChanged);
  //console.log(token.iat < passChanged);

  if (token.iat < passChanged) {
    return false;
  }

  return true;
};

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  return next();
});

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() + 1000;

  return next();
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
