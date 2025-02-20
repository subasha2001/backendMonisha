const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String
  },
});

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subCategory: {
    type: [SubcategorySchema],
    default: []
  },
});

const CategoryModel = mongoose.model('Category', CategorySchema);

module.exports = CategoryModel;