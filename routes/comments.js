const express = require('express');
const { isLoggedIn } = require('./middlewares');
const { upload } = require('../utils/upload.js');
const router = express.Router();
const controller = require('../controllers/comments');

router.post('/img', isLoggedIn, upload.single('img'), controller.sendFileName);

router.get('/:postId', isLoggedIn, controller.getCommentList);

module.exports = router;
