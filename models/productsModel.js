const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String },
  images: { type: String, required: true },
  stock: { type: Number },
  brand: { type: String, required: true },
  price: { type: String },
  part_number: { type: String }
}, { timestamps: true });

const ProductsModel = model("products", productSchema);

module.exports = { ProductsModel };