const express = require('express');
const { upload } = require('../utils/upload.js');
const emailController = require('../controllers/email');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const controller = require('../controllers/auth');

const router = express.Router();

router.post('/join', controller.join);

router.post('/request/email', emailController.sendEmailToJoin);

// router.post('/request/email-pwd', emailController.sendEmailForPwd);

router.post('/confirm', controller.emailConfirm);

router.post('/login/email', controller.login);

router.post('/login/guest', controller.guestLogin);

router.post('/login/google', controller.googleLogin);

router.post('/logout', isLoggedIn, controller.logout);

router.post('/delete', isLoggedIn, controller.deleteUser);

router.post('/find-pwd', controller.findPassword);

router.post('/refresh', isLoggedIn, controller.refresh);


module.exports = router;
