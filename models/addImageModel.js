const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  image: {
    type: String,
    default: "",
  },
});

const user = mongoose.model("User", userSchema);

module.exports = user;