const express = require('express');
const asyncHandler = require('express-async-handler');
const BrandModel = require('../models/Brand');
const { ProductsModel } = require('../models/productsModel');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const brands = await BrandModel.find();
    res.json(brands);
  })
);

router.get('/brand/:brandname', async (req, res) => {
    try {
        const products = await ProductsModel.find({ brand: req.params.brandname }).populate('category');
        const categories = products.map(product => product.category);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const newBrand = new BrandModel({ name });
    await newBrand.save();

    res.status(201).json({ message: 'Brand added successfully', newBrand });
  })
);

// PUT (update) an existing brand
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const updatedBrand = await BrandModel.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json({ message: 'Brand updated successfully', updatedBrand });
  })
);

// DELETE a brand
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedBrand = await BrandModel.findByIdAndDelete(id);

    if (!deletedBrand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json({ message: 'Brand deleted successfully' });
  })
);

//search by brand name
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const brands = await BrandModel.find({
      name: { $regex: query, $options: 'i' },
    });

    if (brands.length === 0) {
      return res.status(404).json({ message: 'No Brands found' });
    }

    res.status(200).json({ brands });
  })
);

module.exports = router;