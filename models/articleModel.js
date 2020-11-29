const mongoose = require('mongoose');
const slugify = require('slugify');

const arcticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'An article should have a title'],
    },
    design: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    demoLink: String,
    introduction: {
      type: String,
      requierd: [true, 'Introduction is required'],
    },
    category: {
      type: String,
      required: [true, 'An article should have a category'],
    },
    titleLimited: String,
    coverImage: {
      type: String,
      required: [true, 'An article should have a cover image'],
    },
    content: [
      {
        type: mongoose.Mixed,
        heading: String,
        code: String,
        subHeading: String,
        image: String,
        paragraph: String,
      },
    ],
    publishedOn: {
      type: Date,
      default: Date.now(),
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, "Something's not right"],
    },
    dislikes: {
      type: Number,
      default: 0,
      min: [0, "Something's not right"],
    },
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

arcticleSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'articleId',
  localField: '_id',
});

arcticleSchema.index({ title: 'text' });

arcticleSchema.pre('save', function (next) {
  let name = this.title;
  let newTitle = [];
  if (name.length > 55) {
    name = name.split(' ');
    name.reduce((acc, cur) => {
      if (acc + cur.length <= 55) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);
    this.titleLimited = `${newTitle.join(' ')}...`;
    return next();
  }
  this.titleLimited = this.title;
  return next();
});

arcticleSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Article = mongoose.model('Article', arcticleSchema);

module.exports = Article;
