const express = require('express');
const { upload } = require('../utils/upload.js');
const emailController = require('../controllers/email');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const controller = require('../controllers/auth');

const router = express.Router();

router.post('/join', controller.join);

router.post('/request/email', emailController.sendEmailToJoin);

// router.post('/request/email-pwd', emailController.sendEmailForPwd);

router.post('/confirm', controller.emailConfirm);

router.post('/login/email', controller.login);

router.post('/login/guest', controller.guestLogin);

// router.post('/login/google', controller.guestLogin);

router.post('/logout', isLoggedIn, controller.logout);

router.post('/delete', isLoggedIn, controller.deleteUser);

router.post('/find-pwd', controller.findPassword);

router.post('/refresh', isLoggedIn, controller.refresh);

const {OAuth2Client} = require('google-auth-library');
const CLIENT_IDS = [
  process.env.CLIENT_ID1,
  process.env.CLIENT_ID2,
  process.env.CLIENT_ID3
]
const client = new OAuth2Client(CLIENT_IDS);

const verify = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: CLIENT_IDS,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return payload;
}

router.post('/login/google', async (req, res, next) => {
    const { id_token } = req.body;
  
    try {
      const payload = await verify(id_token);
      console.log(payload);
      if (!payload) {
        return res
        .status(403)
        .json({ result: false, text: '인증 실패' });
      }
  
      const exUser = await User.findOne({ where: { sns_id: payload.sub } });
      if (exUser) {  
        const userId = exUser.id;
        const provider = exUser.dataValues.provider;
        const name = exUser.dataValues.name;
        const email = exUser.dataValues.email;
  
        const token = jwt.sign(
          {
            userId,
            email,
            provider,
            name,
          },
          secretObj.secret,
          {
            expiresIn: '30m',
          },
        );
  
        res.cookie('user', token);
        res.json({
          result : true,
        //   userId,
        //   email,
        //   provider,
        //   name,
          token,
        });
      } else {
        const newUser = await User.create({
          sns_email: payload.email,
          sns_id: payload.sub,
          provider: 'google',
          img_url: payload.picture,
          name: payload.name || 'defalt name',
        });
        res.json({
          result: true,
        //   sns_id: payload.sub,
          state: 0,
          text: 'userType, name 인증 필요',
        });
      }
    } catch {
      return res
        .status(403)
        .json({ result: false, state: 1, text: '잘못된 인증' });
    }
  });

module.exports = router;
