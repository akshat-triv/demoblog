const multer = require('multer');
const sharp = require('sharp');

const Article = require('./../models/articleModel');
const Comment = require('./../models/commentModel');
const ApiFeatures = require('./../utils/apiFetures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (res, file, cb) => {
  if (file.mimetype.split('/'[0] === 'image')) cb(null, true);
  else cb(new AppError('Only photos can be uploaded', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhotos = upload.any();

exports.resizePhotos = catchAsync(async (req, res, next) => {
  await Promise.all(
    req.files.map(async (image, i) => {
      const imageName = `${Date.now()}-${image.fieldname}`;
      //console.log(image.fieldname);
      if (image.fieldname === 'coverImage') {
        await sharp(image.buffer)
          .resize(720, 405)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`./public/images/${imageName}.jpg`);
      } else {
        await sharp(image.buffer)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`./public/images/${imageName}.jpg`);
      }

      req.body[image.fieldname] = imageName;
    })
  );
  next();
});

function formatToSchema(req) {
  let articleObj = {
    content: [],
  };

  Object.keys(req.body).forEach((key, i) => {
    if (
      key.startsWith('image') ||
      key.startsWith('paragraph') ||
      key.startsWith('heading') ||
      key.startsWith('subHeading')
    ) {
      let number = key.split('-')[1] * 1;
      if (articleObj.content[number - 1]) {
        let obj = { ...articleObj.content[number - 1] };
        let tmp = {};
        tmp[key.split('-')[0]] = req.body[key];
        articleObj.content[number - 1] = Object.assign(tmp, obj);
      } else {
        let tmp = {};
        tmp[key.split('-')[0]] = req.body[key];
        articleObj.content[number - 1] = tmp;
      }
    } else {
      articleObj[key] = req.body[key];
    }
  });
  //console.log(articleObj);
  return articleObj;
}

exports.searchArticles = catchAsync(async (req, res, next) => {
  const articles = await Article.find(
    { $text: { $search: req.params.searchQuery } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });

  if (!articles) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'no matching articles' });
  }

  res.status(201).json({ status: 'success', data: { articles } });
});

exports.createPost = catchAsync(async (req, res, next) => {
  articleObj = formatToSchema(req);
  const newArticle = await Article.create(articleObj);

  res.status(201).json({ status: 'success', data: { newArticle } });
});

exports.getallPosts = catchAsync(async (req, res, next) => {
  let query = Article.find();
  let reqQuery = req.query;

  let features = new ApiFeatures(query, reqQuery)
    .filter()
    .fieldsSelect()
    .pagent()
    .sort();

  query = features.query;

  const articles = await query;

  res
    .status(200)
    .json({ status: 'success', length: articles.length, data: { articles } });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.articleId).populate(
    'comments'
  );

  if (!article) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'No such article exists' });
  }

  res.status(200).json({ status: 'success', data: { article } });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const article = await Article.findByIdAndUpdate(
    req.params.articleId,
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );

  if (!article) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'No such article present' });
  }

  res.status(200).json({ status: 'success', data: { article } });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const article = await Article.findByIdAndDelete(req.params.articleId);

  if (!article) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'No such article present' });
  }

  await Comment.deleteMany({ articleId: req.params.articleId });

  res.status(204).json({ status: 'success' });
});
