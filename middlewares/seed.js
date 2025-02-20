const mongoose = require('mongoose');
const Coupon = require('../models/couponModel');

const categories = [
    { code: 'SWFJN7JASN' },
    { code: 'SWFJN7JBSN' },
    { code: 'SWFJN7JCSN' }
];

mongoose.connect('mongodb+srv://subasha:s0GeZmOZ7ZK1HLP5@cluster0.bkee1lo.mongodb.net/monishaTrades?retryWrites=true&w=majority&appName=Cluster0')
    .then(async () => {
        console.log('Connected to MongoDB');

        await Coupon.deleteMany();

        await Coupon.insertMany(categories);
        console.log('Categories seeded successfully');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        mongoose.disconnect();
    });

//node middlewares/seed.js