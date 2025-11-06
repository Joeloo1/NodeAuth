const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const productmodel = require('./../models/productmodel');

exports.getAllProduct = catchAsync(async (req, res, next) => {
  const product = await Product.find();

  res.status(200).json({
    status: 'success',
    result: product.length,
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError('No product  found with the ID', 401));
  }
  res.status(201).json({
    status: 'Success',
    data: null,
  });
});
