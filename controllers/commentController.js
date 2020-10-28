const factory = require('./factoryController');
const Comment = require('./../models/commentModel');

exports.getAllComment = factory.getAll(Comment);
exports.getComment = factory.getOne(Comment);
exports.postComment = factory.createOne(Comment);
exports.deleteComment = factory.deleteOne(Comment);
exports.updateComment = factory.updateOne(Comment);
