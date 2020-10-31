const Article = require('./../models/articleModel');
const ApiFeatures = require('./../utils/apiFetures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  let query = {};
  let page = 'home';
  if (req.params.w) {
    if (
      !['html&css', 'javascript', 'nodejs', 'mongodb'].includes(req.params.w)
    ) {
      return next(new AppError(`cannot process ${req.originalUrl}`, 404));
    }
    query = { category: req.params.w };
    page = req.params.w;
  }
  const articles = await Article.find(query)
    .sort('-publishedOn')
    .select('coverImage title titleLimited publishedOn slug');

  if (articles) {
    return next(new AppError(`Sorry no articles on this topic right now`, 404));
  }

  res.render('home', {
    articles,
    title: 'Overview',
    page,
  });
});

async function getRelated(searchString) {
  const articles = await Article.find(
    { $text: { $search: searchString } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);

  return articles;
}

exports.search = catchAsync(async (req, res, next) => {
  const articles = await Article.find(
    { $text: { $search: req.params.searchQuery } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });

  if (!articles[0]) {
    return next(new AppError('No matching articles', 404));
    console.log(1);
  }

  res.render('home', {
    articles,
    title: 'Search',
    searchVal: req.params.searchQuery,
  });
});

exports.getArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findOne({
    slug: req.params.articleSlug,
  }).populate({
    path: 'comments',
    options: {
      sort: '-createdAt name',
    },
  });

  if (!article) {
    return next(new AppError('No such article exists', 404));
  }

  let related = await getRelated(article.title);

  const index = related.findIndex(
    (val, i) => val.slug === req.params.articleSlug
  );

  related.splice(index, 1);

  //console.log(related);

  res.render(`article${article.design}`, {
    article,
    title: article.titleLimited,
    related,
  });
});
