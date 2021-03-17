let express = require('express');
// let models = require("../models");
const bcrypt = require('bcrypt');

let router = express.Router();

let jwt = require("jsonwebtoken")
let secretObj = require("../config/jwt");

router.post('/join/:email/:nick/:password', async (req, res, next) => {
  // const { email, nick, password } = req.body;
  const email = req.params.email;
  const nick = req.params.nick;
  const password = req.params.password;

  try {
    // const exUser = await User.findOne({ where: { email } });
    // if (exUser) {
    //   return res.redirect('/join?error=exist');
    // }
    // const hash = await bcrypt.hash(password, 12);
    // await User.create({
    //   email,
    //   nick,
    //   password: hash,
    // });
    console.log(email, nick, password);
    // return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
})




router.post("/login",(req, res, next)=>{
    let token = jwt.sign({
        email: "aaa@example.com"
    },
    secretObj.secret , 
    {
        expiresIn: '5m'
    })


// models.user.find({
//     where: {
//       email: "aaa@example.com"
//     }
//   })
//   .then( user => {
//     if(user.pwd === "1234"){
//       res.cookie("user", token);
//       res.json({
//         token: token
//       })
//     }
//   })

    res.cookie("user", token);
    res.json({
      token: token
    })
});

module.exports = router;