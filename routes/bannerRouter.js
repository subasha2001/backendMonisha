const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require("multer");
const { BannerModel, Currency } = require('../models/bannerModel');
const fs = require("fs");
const path = require("path");
const { ProductsModel } = require('../models/productsModel');
const NewsTickerModel = require('../models/newsticker')
const { UserModel } = require('../models/userModel');
const CategoryModel = require('../models/categories');
const BrandModel = require('../models/Brand');
const Order = require('../models/orderModel')

const router = express.Router();

router.delete('/:productId', (req, res) => {
    BannerModel.deleteOne({ _id: req.params.productId }).then(result => { });
    res.status(200).json({ message: 'Banner deleted!' });
});

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

router.post("/upload", upload.single("image"), (req, res) => {
    res.json({
        imageUrl: `${req.file.filename}`,
    });
});

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
        const ordersCount = await Order.countDocuments();

        res.json({
            products: productCount,
            users: userCount,
            categories: categoryCount,
            brands: brandCount,
            orders: ordersCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching counts' });
    }
});

router.get('/newsticker', async (req, res) => {
    try {
        const data = await NewsTickerModel.find();
        res.json(data);
    } catch (error) {
        console.error("Error fetching news ticker:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put('/newsticker/:id', async (req, res) => {
    try {
        const { newsticker } = req.body;
        if (!newsticker) {
            return res.status(400).json({ error: "News ticker text is required" });
        }

        const updatedTicker = await NewsTickerModel.findByIdAndUpdate(
            req.params.id,
            { newsticker: newsticker },
            { new: true }
        );

        if (!updatedTicker) {
            return res.status(404).json({ error: "News ticker not found" });
        }

        res.json({ message: "News ticker updated successfully", data: updatedTicker });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/currency/", async (req, res) => {
    const number = await Currency.findOne();
    res.json(number);
});

router.post("/currency/", async (req, res) => {
    const { value } = req.body;
    let number = await Currency.findOne();

    if (number) {
        number.value = value;
    } else {
        number = new Currency({ currency: value });
    }

    await number.save();
    res.json({ message: "Number updated successfully", number });
});

router.put("/currency/:id", async (req, res) => {
    try {
        const { value } = req.body;
        const updatedCurrency = await Currency.findByIdAndUpdate(
            req.params.id,
            { currency: value },
            { new: true, runValidators: true }
        );

        if (!updatedCurrency) {
            return res.status(404).json({ error: "Currency not found" });
        }

        res.json({ message: "Currency updated successfully", updatedCurrency });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;