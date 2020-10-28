const mongoose = require('mongoose');

const commnetSchema = new mongoose.Schema({
  name: String,
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  articleId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Article',
    required: [true, 'A comment should belong to an article'],
  },
});

const Comment = mongoose.model('Comment', commnetSchema);

module.exports = Comment;
