const express = require('express');
const { isLoggedIn } = require('./middlewares');
const { upload } = require('../utils/upload.js');
const controller = require('../controllers/users');

const router = express.Router();

router.post('/img', isLoggedIn, upload.single('img'), controller.sendFileName);

router.get('/my-info', isLoggedIn, controller.getMyInfo);

router.put('/my-info', isLoggedIn, controller.modifyMyInfo);

module.exports = router;
