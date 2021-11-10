const express = require('express');
// const { upload, upload2 } = require('../utils/upload.js');
// const { isLoggedIn, hasLisence, isAdmin } = require('./middlewares');
// const controller = require('../controllers/posts');

const router = express.Router();

// router.post(
//   '/imgs',
//   isLoggedIn,
//   upload.array('img', 5),
//   controller.sendFileNames,
// ); //다중 이미지 업로드

// router.get(
//   '/cotreat-request',
//   isLoggedIn,
//   hasLisence,
//   controller.getCoTreatRequestList,
// ); //협진요청 리스트

// router.get(
//   '/cotreat-accept',
//   isLoggedIn,
//   hasLisence,
//   controller.getCoTreatAcceptList,
// ); //협진수락 리스트

// router.get('/anytreat/users/:userid', isLoggedIn, controller.getPostListByUser); //모든 진료에대해 해당 유저가 쓴 포스트 리스트

// router.get(
//   '/anytreat/docs/:userid',
//   isLoggedIn,
//   hasLisence,
//   controller.getPostListByDoc,
// ); //모든 진료에대해 해당 1차의사가 답한 포스트 리스트

// router.get(
//   '/anytreat/codocs/:userid',
//   isLoggedIn,
//   hasLisence,
//   controller.getPostListByCoDoc,
// ); //모든 진료에대해 해당 협진의사가 답한 포스트 리스트

// router.get('/anytreat/lists', isLoggedIn, hasLisence, controller.getPostList); //모든 진료 리스트

// router.get('/anytreat/lists/:postid', isLoggedIn, controller.getPostDetail); //해당 포스트 디테일

// router.delete('/anytreat/lists/:postid', isAdmin, controller.deletePost); //해당 포스트 삭제

// // router.post('/treat-done', isLoggedIn, controller.treatDone); //진료 완료 테스트용 deprecated!!

// // router.post('/test-push', isLoggedIn, async (req, res, next) => {
// //   try {
// //     let { fcm_message } = req.body;
// //     const user = await User.findOne({ where: { id: req.decoded.userId } });
// //     console.log('psh test : ', user.push_token);
// //     fcm_message.tokens = [user.push_token];
// //     let loging = await firebasePushWithOption(fcm_message);
// //     res.json({ log: loging });
// //   } catch (err) {
// //     console.error(err);
// //     next(err);
// //   }
// // }); //푸쉬 테스트 deprecated!!

// router.post('/ask', isLoggedIn, controller.askAdmin);

// router.get('/ask/lists', isAdmin, controller.getAskingAdminList);

// router.post('/ask/accept', isAdmin, controller.acceptAskingAdmin);

module.exports = router;
