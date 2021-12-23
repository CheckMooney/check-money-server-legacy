const express = require('express');
// const { upload, upload2 } = require('../utils/upload.js');
const { isLoggedIn } = require('./middlewares');
const controller = require('../controllers/accounts');

const router = express.Router();

// router.post(
//   '/imgs',
//   isLoggedIn,
//   upload.array('img', 5),
//   controller.sendFileNames,
// ); //다중 이미지 업로드

router.get(
  '/',
  isLoggedIn,
  controller.getAccounts,
);

router.post(
    '/',
    isLoggedIn,
    controller.createAccount,
);
  
router.put(
    '/:accountId',
    isLoggedIn,
    controller.updateAccount,
);

router.delete(
    '/:accountId',
    isLoggedIn,
    controller.deleteAccount,
);

router.get(
    '/:accountId/transactions',
    isLoggedIn,
    controller.getTransactions,
  );

router.get(
  '/:accountId/subscriptions',
  isLoggedIn,
  controller.getSubscriptions,
);
router.post(
  '/:accountId/subscriptions',
  isLoggedIn,
  controller.createSubscriptions,
);
router.put(
  '/:accountId/subscriptions/:subscriptionId',
  isLoggedIn,
  controller.updateSubscriptions,
);
router.delete(
  '/:accountId/subscriptions/:subscriptionId',
  isLoggedIn,
  controller.deleteSubscriptions,
);

module.exports = router;
