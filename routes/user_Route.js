var express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, addSubUser, getSubuser, deleteSubuser, getCartItem, addCartItem} = require('../controller/userController');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../config/auth')

router.route('/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    body('name').isLength({ min: 3 })
]).post(registerUser)
router.route('/login').post(loginUser)
router.route('/addCartItem').post(auth.auth, addCartItem) 
router.route('/getCartItem').get(auth.auth, getCartItem)

module.exports = router;
