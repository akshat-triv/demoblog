const express = require('express');
const commentController = require('./../controllers/commentController');
const router = express.Router();

router
  .route('/')
  .post(commentController.postComment)
  .get(commentController.getAllComment);

router
  .route('/:articleId')
  .get(commentController.getComment)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

module.exports = router;
