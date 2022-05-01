const fireBaseAdmin = require('firebase-admin');
const { User } = require('../models');

const serviceAccount = require('../config/firebaseConfig');

fireBaseAdmin.initializeApp({
  credential: fireBaseAdmin.credential.cert(serviceAccount),
});

const firebasePush = (notification, data, tokens) => {
  if (!tokens.length) {
    return;
  }
  data.priority = 'high';
  data.sound = 'default';

  const fcm_message = {
    notification,
    android: {
      priority: 'high',
      notification: {
        notification_priority: 'PRIORITY_HIGH',
        default_sound: 'true',
        default_vibrate_timings: 'true',
      },
    },
    data,
    tokens,
    content_available: 'true',
  };

  fireBaseAdmin
    .messaging()
    .sendMulticast(fcm_message)
    .then(res => {
      console.log('push' + JSON.stringify(res));
    });
};

// const firebasePushWithOption = async fcm_message => {
//   return await fireBaseAdmin.messaging().sendMulticast(fcm_message);
// };

const firebasePushToUserId = async (notification, data, userIds) => {
  const tokens = [];
  userIds.forEach(async element => {
    const user = await User.findOne({ where: { id: element } });
    if (user?.push_token) tokens.push(user.push_token);
  });
  console.log(tokens);

  if (tokens.length === 0) return;
  firebasePush(notification, data, tokens);
};

// firebasePush(
//   {
//     title: '시범 전송',
//     body: '제 목소리가 들리나요...?',
//   },
//   {

//     result: 'true',
//     time: `현재 시간`,
//   },
//   [test_token],
// );

module.exports = {
  firebasePush,
  firebasePushToUserId,
};
