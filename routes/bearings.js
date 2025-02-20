const express = require('express');
const router = express.Router();
const { MiniaturePrecision } = require('../models/ballbearings');

router.get('/ballBearings/miniPrecision/', async (req, res) => {
    try {
        const products = await MiniaturePrecision.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/ballBearings/miniPrecision/:id', async (req, res) => {
    try {
        const product = await MiniaturePrecision.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.post('/ballBearings/miniPrecision/', async (req, res) => {
    try {
        const newProduct = new MiniaturePrecision(req.body);
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error });
    }
});

router.put('/ballBearings/miniPrecision/:id', async (req, res) => {
    try {
        const updatedProduct = await MiniaturePrecision.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
});

router.delete('/ballBearings/miniPrecision/:id', async (req, res) => {
    try {
        const deletedProduct = await MiniaturePrecision.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

module.exports = router;