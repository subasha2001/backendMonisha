require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dbConnect = require("./configs/db.config");
const productsRouter = require('./routes/productsRouter');
const bearingsRouter = require('./routes/bearings');
const importProducts = require('./routes/importProducts');
const categoriesRouter = require('./routes/categories');
const brandsRouter = require('./routes/brands');
const bannerRouter = require('./routes/bannerRouter');
const userRouter = require('./routes/userRouter');
const manualRouter = require('./routes/manualRouter');
const couponRouter = require('./routes/couponRouter');
const bodyParser = require('body-parser');
const orderRouter = require('./routes/orderRouter');
const reviewsRouter = require('./routes/reviewsRouter');
const emailRouter = require('./routes/emailRouter');
const path = require('path');

dbConnect();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4000',
      "https://cadyinfotech.com"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Access-Control-Allow-Origin',
      'Content-Type',
      'Authorization',
      'Bearer_Token',
      'X-Requested-With',
      'Accept',
    ],
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/products', productsRouter);
app.use('/api/bearings', bearingsRouter);
app.use('/api/import', importProducts);
app.use('/api/categories', categoriesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/users', userRouter);
app.use('/api/manuals', manualRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/mailer', emailRouter);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads/products', express.static(path.join(__dirname, 'uploads/products')));
app.use('/api/uploads/banners', express.static('uploads/banners'));
app.use('/api/uploads/manuals', express.static('uploads/manuals'));
app.use('/api/uploads/subCategories', express.static('uploads/subCategories'));

app.listen(process.env.PORT, () => {
  console.log('Connected to ' + process.env.PORT);
});