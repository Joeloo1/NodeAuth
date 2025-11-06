const mongoose = require('mongoose');

// REVIEW SCHEMA
const reviewSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: [true, 'Review must belong to a user '],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: [true, 'Review must have a comment'],
  },
});
// PRODUCT SCHEMA
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'A product  must have a price...'],
  },
  unit: {
    type: String,
    default: 0,
  },
  image: {
    type: String,
    required: [true, 'A product must have an inage URL...'],
  },
  discount: {
    type: Number,
    default: 0,
  },
  availability: {
    type: Boolean,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 4.0,
  },
  reviews: [reviewSchema],
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
