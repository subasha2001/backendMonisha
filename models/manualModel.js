const mongoose = require('mongoose');

const PdfSchema = new mongoose.Schema({
  name: String,
  path: String,
  category: String,
  productFamily: String
});

const Pdf = mongoose.model("Pdf", PdfSchema);

module.exports = Pdf;