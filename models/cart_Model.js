const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;
6
const cartSchema = new mongoose.Schema({
  cart_items: {
    type: Array,
    required: [true, "Please Enter Your Cart Items"]
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
});



module.exports = mongoose.model("userCart", cartSchema);