const express = require('express');
const { isLoggedIn } = require('./middlewares');
const authRouter = require('./auth');
const accountsRouter = require('./accounts');
const usersRouter = require('./users');
const transactionsRouter = require('./transactions');

let router = express.Router();

router.get('/', isLoggedIn, function (req, res, next) {
  res.status(200).send('logined : API access allowed');
});

router.get('/category', isLoggedIn, function (req, res, next) {
  res.status(200).json({
    "category" :[ "식비", "쇼핑", "주거비", "의료비","생활용품비", "통신비", "교통비", "기타"]
  });
});


module.exports = {
  indexRouter: router,
  authRouter,
  accountsRouter,
  usersRouter,
  transactionsRouter,
};
