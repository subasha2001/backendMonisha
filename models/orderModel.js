const { model, Schema, Types } = require("mongoose");

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 5 },
    imageDis: { type: String, required: true },
    imageHov: { type: String, required: true },
    description: { type: String },
    metalType: { type: [String], required: true },
    category: { type: [String], required: true },
    weight: { type: Number, min: 0 },
    size: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    wastage: { type: Number, min: 0 },
    price: { type: Number, min: 0 },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const OrderItemSchema = new Schema({
  product: { type: ProductSchema, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: Number, required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    totalPrice: { type: Number, required: true },
    items: { type: [OrderItemSchema], required: true },
    status: { type: String, default: 'NEW' },
    user: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const OrderModel = model("order", OrderSchema);

module.exports = { OrderModel };