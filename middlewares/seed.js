const mongoose = require('mongoose');
const BrandModel = require('../models/Brand');

const categories = [];

mongoose.connect('mongodb+srv://subasha:s0GeZmOZ7ZK1HLP5@cluster0.bkee1lo.mongodb.net/monishaTrades?retryWrites=true&w=majority&appName=Cluster0')
    .then(async () => {
        console.log('Connected to MongoDB');
        await BrandModel.deleteMany();
        await BrandModel.insertMany(categories);
        console.log('Categories seeded successfully');
        mongoose.disconnect();
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });