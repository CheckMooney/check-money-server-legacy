const jwt = require('jsonwebtoken');
const secretObj = require('../config/jwt');
const { User } = require('../models');

exports.isLoggedIn = (req, res, next) => {
  let token =
    req.cookies?.user || req.headers?.authorization?.split('Bearer ')[1];
  if (token) {
    try {
      let decoded = jwt.verify(token, secretObj.secret);
      // console.log('userId:' + decoded.userId);
      if (decoded) {
        req.decoded = decoded;
        next();
      } else {
        res.status(401).json({ result: false, text: '로그인 필요' });
      }
    } catch {
      res.status(401).json({ result: false, text: 'TokenExpired 세션만료' });
    }
  } else {
    res.status(401).json({ result: false, text: '로그인 필요' });
  }
};

// exports.isNotLoggedIn = (req, res, next) => {

//     let token = req.cookies.user;
//     if (!token) next();

//     try{
//         let decoded = jwt.verify(token, secretObj.secret)
//         if (!decoded) {
//             next();
//         } else {
//             res.send('이미 로그인한 상태입니다.');
//         }
//     } catch {
//         next();
//     }
// };
