const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const user_Model = require("../models/user_Model");
const bcrypt = require('bcryptjs')
const ErrorHandler = require("../utils/errorhandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const nodeMailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const cart_Model = require("../models/cart_Model");
const { errorMonitor } = require("stream");

module.exports = {
    registerUser: catchAsyncErrors(async (req, res, next) => {
        const { name, email, password, contact_no } = req.body
        let success = false
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() })
        } else {
            await user_Model.findOne({ email: email }).exec()
                .then((_emailfound) => {
                    console.log(_emailfound)
                    if (!_emailfound) {
                        bcrypt.hash(password, 10, (err, hash) => {
                            const _user = user_Model({
                                name,
                                email,
                                contact_no,
                                password: hash,
                            })
                            _user.save().then((user) => {
                                const token = jwt.sign({ _id: user._id }, "Mykey123")
                                user_Model.find({}).sort({ _id: -1 }).limit(1)
                                    .then((__user) => {
                                        user_Model.findByIdAndUpdate({ _id: __user[0]._id }, {
                                            resetPasswordToken: token
                                        }).exec()
                                            .then((_resetadd) => {
                                                user_Model.find({}).sort({ _id: -1 })
                                                    .limit(1)
                                                    .then((__user) => {
                                                        res.status(201).json({ user: __user })
                                                    })
                                            })
                                    })
                            })
                        })
                    } else {
                        return next(new ErrorHandler("Email is already used", 404));
                    }
                })
        }

    }),

    loginUser: catchAsyncErrors(async (req, res, next) => {
        const { email, password } = req.body
        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 404));
        } else {
            user_Model.findOne({ email: email })
                .exec()
                .then((user) => {
                    if (user) {
                        if (bcrypt.compareSync(password, user.password)) {
                            const token = jwt.sign({
                                _id: user._id
                            }, "Mykey123")
                            res.status(201).json({ user: user, token: token })
                        } else {
                            return next(new ErrorHandler("Invalid email and password", 404));
                        }
                    } else {
                        return next(new ErrorHandler("Invalid email and password", 404));
                    }
                })

        }
    }),
    addCartItem: catchAsyncErrors(async (req, res, next) => {
        const { cart_items } = req.body

        if (!cart_items) {
            return next(new ErrorHandler("Please enter cart_items", 404));
        }
        cart_Model.findOne({ userId: req.user._id })
            .exec().then((_cart_item) => {
                if (_cart_item) {
                    cart_Model.findOneAndUpdate({ userId: req.user._id }, {
                        cart_items
                    }).exec().then((_cart) => {
                        res.status(201).json({ success: "Cart Update Succesfully !!" })
                    }).catch((err) => {
                        console.log(err)
                        return next(new ErrorHandler(err, 404));
                    })
                } else {
                    const cartItem = new cart_Model({
                        userId: req.user._id,
                        cart_items
                    })
                    cartItem.save()
                        .then((_cartAdd) => {
                            if (_cartAdd) {
                                res.status(201).json({ success: "Cart Added Succesfully !!" })
                            } else {
                                return next(new ErrorHandler("Something went wrong", 404));
                            }
                        }).catch((err) => {
                            console.log(err)
                            return next(new ErrorHandler(err, 404));
                        })
                }
            })


    }),
    getCartItem: catchAsyncErrors(async (req, res, next) => {
        cart_Model.find({
            userId: req.user._id
        })
        .then((data) => {
            if (data) {
                const cartDataWithTotalPrice = data.map((cart) => {
                    const totalPrice = cart.cart_items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
                    return { ...cart.toObject(), totalPrice }; // Add totalPrice to the cart object
                });
    
                res.status(201).json({ success: true, result: cartDataWithTotalPrice });
            }
        }).catch((err) => {
            console.log(err)
            return next(new ErrorHandler(err, 404));
        })
    })
}