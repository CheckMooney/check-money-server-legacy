const express = require('express');
const { isLoggedIn } = require('./middlewares');
// const { upload } = require('../utils/upload.js');
const router = express.Router();
const controller = require('../controllers/transactions');

router.get('/', isLoggedIn, controller.getTransactions);

router.post('/', isLoggedIn, controller.createTransaction);

// router.get('/:transactionId', isLoggedIn, controller.getCommentList);

router.put('/:transactionId', isLoggedIn, controller.updateTransaction);

router.delete('/:transactionId', isLoggedIn, controller.deleteTransaction);

// router.get('/:transactionId', isLoggedIn, controller.getCommentList);

module.exports = router;
