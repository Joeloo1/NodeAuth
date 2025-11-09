const express = require('express');
const authController = require('./../controller/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.post('/forgetPassword', authController.forgetPassword)
router.post('/resetPassword/:token', authController.resetPassword)

module.exports = router;
