const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFetures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('Document does not exist', 404));
    }

    res.status(204).json({ status: 'success', message: { doc } });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('Document does not exist', 404));
    }

    res.status(200).json({ status: 'success', data: { doc } });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //const newTour = new Tour({});
    //newTour.save()

    const doc = await Model.create(req.body);

    res.status(201).json({ status: 'success', data: { data: doc } });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('Document does not exist', 404));
    }

    res.status(200).json({ status: 'success', data: { doc } });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.params.tourId) filter['tour'] = req.params.tourId;

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fieldsSelect()
      .pagent();
    //console.log(features.query);
    const doc = await features.query;
    // const query = Tour.find()
    //   .where('difficulty')
    //   .equals('easy')
    //   .where('duration')
    //   .equals(5);
    res
      .status(200)
      .json({ status: 'success', length: doc.length, data: { data: doc } });
  });
