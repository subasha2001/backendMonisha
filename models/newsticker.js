const mongoose = require('mongoose');

const NewsTickerSchema = new mongoose.Schema({
  newsticker: {
    type: String,
    required: true,
  }
});

const NewsTickerModel = mongoose.model('NewsTicker', NewsTickerSchema);

module.exports = NewsTickerModel;