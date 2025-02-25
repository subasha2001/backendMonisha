const { model, Schema } = require("mongoose");

const BannerSchema = new Schema(
  {
    image: { type: String, required: true },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

const ReviewSchema = new Schema(
  {
    productName: { type: String, required: true },
    imageDis: { type: String, required: true },
    name: { type: String, required: true },
    number: { type: Number, required: true },
    review: { type: String, required: true },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

const CurrencySchema = new Schema(
  {
    currency: { type: Number, required: true }
  }
)

const Currency = model('currency', CurrencySchema);
const BannerModel = model('banner', BannerSchema);
const ReviewModel = model('reviews', ReviewSchema);

module.exports = { BannerModel, ReviewModel, Currency };