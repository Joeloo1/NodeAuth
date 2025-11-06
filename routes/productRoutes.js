const express = require('express');
const productsController = require('./../controller/productsController');
const authController = require('./../controller/authController');

router = express.Router();

router.route('/').get(authController.protect, productsController.getAllProduct);
router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productsController.deleteProduct
  );

module.exports = router;
