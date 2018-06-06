var express = require('express');
var router = express.Router();
var controller = require('./authController');

router.route('/signup')
    .post(controller.signUp);

router.route('/login')
    .post(controller.login);

router.route('/forgot_password')
    .post(controller.forgotPassword);

router.route('/reset_password')
    .get(express.static('././public'), controller.renderResetPasswordTemplate)
    .post(controller.resetPassword);

router.route('/admin_signup')
    .post(controller.adminSignup);

router.route('/admin_login')
    .post(controller.adminLogin);

module.exports = router;