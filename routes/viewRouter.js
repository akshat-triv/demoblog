const express = require('express');
const viewController = require('./../controllers/viewController');
const router = express.Router();

router.get('/:w?', viewController.getOverview);

router.get('/article/:articleSlug', viewController.getArticle);

router.get('/search/:searchQuery', viewController.search);

module.exports = router;
