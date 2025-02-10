const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

const BrandModel = mongoose.model('Brands', BrandSchema);

module.exports = BrandModel;