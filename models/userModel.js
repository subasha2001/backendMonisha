const { model, Schema } = require("mongoose");
const bcrypt = require('bcrypt');

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    cname: { type: String, required: true },
    number: { type: Number, required: true },
    address: { type: String, required: true },
    pincode: { type: Number, required: true },
    password: { type: String, required: true },
    token: { type: String },
    isActive: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false }
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

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const UserModel = model("user", UserSchema);

module.exports = { UserModel };