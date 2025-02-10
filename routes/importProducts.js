const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const { ProductsModel } = require('../models/productsModel');

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        let jsonData = XLSX.utils.sheet_to_json(sheet);
        
        jsonData = jsonData.map(row => ({
            name: row["Name"] || "Unknown",
            price: parseFloat(row["Price"]?.replace(/[^0-9.]/g, '')) || 0,
            brand: row["Brand"] || "N/A",
            category: row["Category"] || "Unknown",
            subCategory: row["SubCategory"] || "N/A",
            inSubCategory: row["InSubCategory"] || "N/A",
            part_number: row["Part_Number"] || "N/A",
            description: row["Description"] || "No description available",
            longDescription: row["longDescription"] || "No details available",
            image_url: row["Image_URL"] || "https://via.placeholder.com/150",
            stock: parseInt(row["Stock"] || "0", 10) 
        }));

        await ProductsModel.insertMany(jsonData);

        res.status(200).json({ message: "Products added successfully!", insertedCount: jsonData.length });
    } catch (error) {
        console.error("Error inserting data:", error);
        res.status(500).json({ error: "Error processing file", details: error.message });
    }
});

// API: Get All Products
app.get('/products', async (req, res) => {
    const products = await ProductsModel.find();
    res.status(200).json(products);
});


module.exports = app;