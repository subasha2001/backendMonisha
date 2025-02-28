const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userInfo: {
    name: { type: String, required: true },
    cname: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
    country: { type: String, required: true }
  },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      images: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  payment: {
    transactionId: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, default: "Pending" }
  },
  totalAmount: { type: Number, required: true },
  totalQuantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);