const Admin = require('../models/adminModel');
const factory = require('./factoryController');

exports.getAllUsers = factory.getAll(Admin);

exports.createUser = factory.createOne(Admin);

exports.getUser = factory.getOne(Admin);

exports.deleteUser = factory.deleteOne(Admin);

exports.updateUser = factory.updateOne(Admin);
