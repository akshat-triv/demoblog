const express = require('express');
const articleController = require('./../controllers/articleController');
const router = express.Router();

router
  .route('/')
  .post(
    articleController.uploadPhotos,
    articleController.resizePhotos,
    articleController.createPost
  )
  .get(articleController.getallPosts);

router.get('/search/:searchQuery', articleController.searchArticles);

router
  .route('/:articleId')
  .get(articleController.getPost)
  .patch(articleController.updatePost)
  .delete(articleController.deletePost);

module.exports = router;
