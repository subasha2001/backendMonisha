const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema({
  name: { type: String },
  category: { type: String },
  subCategory: { type: String },
  description: { type: String },
  longDescription: { type: String },
  image_url: [{ type: String }],
  stock: { type: Number },
  brand: { type: String },
  price: { type: String },
  part_number: {type: String}
}, { timestamps: true });

const ProductsModel = model("products", productSchema);

module.exports = { ProductsModel };