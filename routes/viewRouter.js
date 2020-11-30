const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');
const router = express.Router();

router.get('/:w?', viewController.getOverview);

router.get(
  '/user/remove/:user_id',
  userController.remove,
  viewController.getRemoved
);

router.get('/admin/login', viewController.getLogin);
router.get(
  '/admin/postArticle',
  authController.protect,
  viewController.getPostArticle
);

router.get('/article/:articleSlug', viewController.getArticle);

router.get('/search/:searchQuery', viewController.search);

module.exports = router;
