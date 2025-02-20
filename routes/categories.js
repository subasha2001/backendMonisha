const express = require('express');
const asyncHandler = require('express-async-handler');
const CategoryModel = require('../models/categories');
const { ProductsModel } = require('../models/productsModel');
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads/subCategories");
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

router.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(200).json({
        imageUrl: `${req.file.filename}`,
        message: 'File uploaded successfully',
        filePath: `/uploads/subCategories/${req.file.originalname}`,
    });
});

router.post(
    '/',
    asyncHandler(async (req, res) => {
        try {
            const { name, subcategories } = req.body;

            if (!name) {
                return res.status(400).json({ message: 'Category name is required' });
            }

            const formattedSubcategories = subcategories.map(sub => ({
                name: sub.name,
                image: sub.image || '' // Default empty string if no image is provided
            }));

            const category = new CategoryModel({ name, subCategory: formattedSubcategories });
            await category.save();
            res.status(201).json({ message: 'Category added successfully', category });
        } catch (error) {
            res.status(500).json({ message: 'Error adding category', error });
        }
    })
);

router.put(
    '/:id',
    asyncHandler(async (req, res) => {
        try {
            const { name, subcategories } = req.body;
            const { id } = req.params;

            const formattedSubcategories = subcategories.map(sub => ({
                name: sub.name,
                image: sub.image || ''
            }));

            const updatedCategory = await CategoryModel.findByIdAndUpdate(
                id,
                { name, subCategory: formattedSubcategories },
                { new: true }
            );

            if (!updatedCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.json({ message: 'Category updated successfully', category: updatedCategory });
        } catch (error) {
            res.status(500).json({ message: 'Error updating category', error });
        }
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

        category.subCategory = category.subCategory.filter(sub => sub.name !== subCategoryName);
        await category.save();

        res.json({ message: 'Subcategory removed successfully', category });
    })
);

router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;

            const deletedCategory = await CategoryModel.findByIdAndDelete(id);

            if (!deletedCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }

            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting category', error });
        }
    })
);

//search by category name
router.get(
    '/search',
    asyncHandler(async (req, res) => {
        try {
            const { query } = req.query;

            const categories = await CategoryModel.find({ name: { $regex: query, $options: 'i' } });

            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error searching categories', error });
        }
    })
);

module.exports = router;