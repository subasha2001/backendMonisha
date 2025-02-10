const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const { ProductsModel } = require("../models/productsModel");
const { jewellers } = require("../data");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = Router();

// Seed Route
router.get(
  "/seed",
  asyncHandler(async (req, res) => {
    const productsCount = await ProductsModel.countDocuments();
    if (productsCount > 0) {
      return res.send("Seed is already done");
    }
    await ProductsModel.create(jewellers);
    res.send("Seed is Done!");
  })
);

// Get all products
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const products = await ProductsModel.find();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })
);

// Search products
router.get(
  "/search/:searchTerm",
  asyncHandler(async (req, res) => {
    const searchRegExp = new RegExp(req.params.searchTerm, "i");
    const products = await ProductsModel.find({
      $or: [
        { name: { $regex: searchRegExp } },
        { category: { $regex: searchRegExp } },
        { brand: { $regex: searchRegExp } },
        { subCategory: { $regex: searchRegExp } }
      ],
    });
    res.send(products);
  })
);

// Get all categories
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const metalType = await ProductsModel.aggregate([
      { $unwind: "$metalType" },
      { $group: { _id: "$metalType" } },
      { $project: { _id: 0, name: "$_id" } },
    ]);
    res.send(metalType);
  })
);

// Get products by category
router.get(
  "/categories/:category",
  asyncHandler(async (req, res) => {
    const product = await ProductsModel.find({
      metalType: req.params.category,
    });
    res.send(product);
  })
);

// Get all brands
router.get(
  "/brands",
  asyncHandler(async (req, res) => {
    const brands = await ProductsModel.aggregate([
      { $unwind: "$brands" },
      { $group: { _id: "$brands" } },
      { $project: { _id: 0, name: "$_id" } },
    ]);
    res.send(brands);
  })
);

// Get products by brand
router.get(
  "/brands/:brand",
  asyncHandler(async (req, res) => {
    const brand = await ProductsModel.find({
      brand: req.params.brand,
    });
    res.send(brand);
  })
);

// Get product by ID
router.get(
  "/:productId",
  asyncHandler(async (req, res) => {
    const product = await ProductsModel.findById(req.params.productId);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.send(product);
  })
);

// Delete product by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await ProductsModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product by ID
router.put("/update/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;

    const updatedProduct = await ProductsModel.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully', updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/products");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Handle image upload
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.status(200).json({
    imageUrl: `${req.file.filename}`,
    message: 'File uploaded successfully',
    filePath: `/uploads/products/${req.file.originalname}`,
  });
});

// Add new product
router.post(
  "/addProduct",
  asyncHandler(async (req, res) => {
    try {
      const productData = req.body;
      const product = new ProductsModel(productData);
      await product.save();
  
      res.status(201).json({ message: 'Product added successfully', product });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  })
);


module.exports = router;