// routes/categoriesRouter.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const CategoryModel = require('../models/categories');
const { ProductsModel } = require('../models/productsModel');

const router = express.Router();

// GET all categories
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const categories = await CategoryModel.find();
        res.json(categories);
    })
);

router.get('/category/:categoryId', async (req, res) => {
    try {
        const products = await ProductsModel.find({ category: req.params.categoryId }).populate('brand');
        const brands = products.map(product => product.brand);
        res.json(brands);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const category = await CategoryModel.findOne({ name: name });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post(
    '/',
    asyncHandler(async (req, res) => {
        console.log("Received body:", req.body); // Debugging line

        const { name, subcategories } = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const newCategory = new CategoryModel({
            name,
            subCategory: subcategories
        });

        await newCategory.save();
        res.status(201).json({ message: 'Category added successfully', newCategory });
    })
);

// CNC power supply-drives and motors, MCB-switchgear and contactor, Electronic tools and test equipment, Passive components

// PUT (update) an existing category
router.put(
    '/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, subCate } = req.body;
        console.log(req.body);


        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            id,
            { name, subCategory: subCate },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category updated successfully', updatedCategory });
    })
);

// PUT (remove subcategory) from an existing category
router.put(
    '/remove-subcategory/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { subCategoryName } = req.body;

        if (!subCategoryName) {
            return res.status(400).json({ message: 'Subcategory name is required' });
        }

        const category = await CategoryModel.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.subCategory = category.subCategory.filter(sub => sub !== subCategoryName);
        await category.save();

        res.json({ message: 'Subcategory removed successfully', category });
    })
);

// DELETE a category
router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;

        const deletedCategory = await CategoryModel.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    })
);

//search by category name
router.get(
    '/search',
    asyncHandler(async (req, res) => {
        const { query } = req.query; // Get search query from query parameters

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Use regex to perform a case-insensitive search on category names
        const categories = await CategoryModel.find({
            name: { $regex: query, $options: 'i' },
        });

        if (categories.length === 0) {
            return res.status(404).json({ message: 'No categories found' });
        }

        res.status(200).json({ categories });
    })
);

module.exports = router;
