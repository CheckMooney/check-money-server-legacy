const express = require('express');
const { isLoggedIn } = require('./middlewares');
const authRouter = require('./auth');
const postsRouter = require('./posts');
const usersRouter = require('./users');
const commentsRouter = require('./comments');

let router = express.Router();

router.get('/', isLoggedIn, function (req, res, next) {
  res.status(200).send('logined : API access allowed');
});

module.exports = {
  indexRouter: router,
  authRouter,
  postsRouter,
  usersRouter,
  commentsRouter,
};
