const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.isLoggedIn = (req, res, next) => {
  let token =
    req.cookies?.user || req.headers?.authorization?.split('Bearer ')[1];
  if (token) {
    try {
      let decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log('userId:' + decoded.userId);
      if (decoded) {
        req.decoded = decoded;
        next();
      } else {
        res.status(401).json({
          "result" : false,
          "code" : 40100, 
          "message": "AUTH_FAIL"
        });
      }
    } catch {
      res.status(403).json({
        "result" : false,
        "code" : 40300, 
        "message": "TOKEN_EXPIRED"
      });
    }
  } else {
    res.status(401).json({
      "result" : true,
      "code" : 40100, 
      "message": "AUTH_FAIL"
    });
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
