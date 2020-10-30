const mongoose = require('mongoose');

const commnetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "What you don't have a name"],
  },
  comment: {
    type: String,
    required: [true, "Hey, you can't comment nothing!"],
  },
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
