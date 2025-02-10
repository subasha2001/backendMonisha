const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require("multer");
const { BannerModel } = require('../models/bannerModel');
const fs = require("fs");
const path = require("path");
const { ProductsModel } = require('../models/productsModel');
const { UserModel } = require('../models/userModel');
const CategoryModel = require('../models/categories');
const BrandModel = require('../models/Brand');

const router = express.Router();

// Delete banner by productId
router.delete('/:productId', (req, res) => {
    BannerModel.deleteOne({ _id: req.params.productId }).then(result => { });
    res.status(200).json({ message: 'Banner deleted!' });
});

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads/banners");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// Handle image upload
router.post("/upload", upload.single("image"), (req, res) => {
    res.json({
        imageUrl: `${req.file.filename}`,
    });
});

// Add new banner
router.post("/addBanner", asyncHandler(
    async (req, res) => {
        const { image } = req.body;
        const existingBanner = await BannerModel.findOne({ image });
        if (existingBanner) {
            return res.status(404).json('Banner already present');
        }

        const newBanner = {
            id: '',
            image
        };

        const dbBanner = await BannerModel.create(newBanner);
        res.send(dbBanner);
    }
));

// Get all banners
router.get("/", asyncHandler(async (req, res) => {
    const bannerImages = await BannerModel.find();
    res.send(bannerImages);
}));

router.get('/counts', async (req, res) => {
    try {
      const productCount = await ProductsModel.countDocuments();
      const userCount = await UserModel.countDocuments();
      const categoryCount = await CategoryModel.countDocuments();
      const brandCount = await BrandModel.countDocuments();
  
      res.json({
        products: productCount,
        users: userCount,
        categories: categoryCount,
        brands: brandCount,
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching counts' });
    }
  });
module.exports = router;