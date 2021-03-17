let jwt = require("jsonwebtoken")
let secretObj = require("../config/jwt");

exports.isLoggedIn = (req, res, next) => {
    let token = req.cookies.user;
    if(token){
        let decoded = jwt.verify(token, secretObj.secret)
        if (decoded) {
            next();
        } else {
            res.status(403).send('로그인 필요');
        }
    }else{
        res.status(403).send('로그인 필요');
    }
    


  };
  
exports.isNotLoggedIn = (req, res, next) => {
    let token = req.cookies.user;
    if (!token) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
    let decoded = jwt.verify(token, secretObj.secret)
    if (!decoded) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
};
