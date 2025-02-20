const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;