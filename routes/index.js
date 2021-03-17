let express = require('express');
// let models = require("../models");
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

let router = express.Router();

router.get("/", isLoggedIn ,function(req, res, next){
    res.send("로그인됨 : API 수행 가능");
})

module.exports = router;
