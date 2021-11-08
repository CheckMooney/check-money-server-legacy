const express = require('express');
const { isLoggedIn } = require('./middlewares');
const { upload } = require('../utils/upload.js');
const controller = require('../controllers/users');

const router = express.Router();

router.post('/img', isLoggedIn, upload.single('img'), controller.sendFileName);

router.get('/my-info', isLoggedIn, controller.getMyInfo);

router.get('/:userid', isLoggedIn, controller.getUserInfo);

router.post('/my-info', isLoggedIn, controller.modifyMyInfo);

// router.post('/majors', isLoggedIn, controller.modifyMyMajor);

module.exports = router;
