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

module.exports = {
  indexRouter: router,
  authRouter,
  accountsRouter,
  usersRouter,
  transactionsRouter,
};
