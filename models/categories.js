const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subCategory: {
    type: [String],
    default: [],
    required: false 
  },
});

const CategoryModel = mongoose.model('Category', CategorySchema);

module.exports = CategoryModel;