const jwt = require('jsonwebtoken');
const { User, LicenseImg, AuthNum, Post } = require('../models');
const hash = require('../utils/hash');
const secretObj = require('../config/jwt');
const axios = require('axios'); //for kakao login

const join = async (req, res, next) => {
  let {
    name, email, password, deviceToken,
  } = req.body;

  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res
        .status(403)
        .json({ result: false, state: 0, text: 'already exists id' });
    }

    const exAuth = await AuthNum.findOne({ where: { email } });
    if (!exAuth || exAuth.status != 1) {
      return res
        .status(403)
        .json({ result: false, state: 1, text: 'email auth needed' });
    }

    const hashedPwd = await hash.getHash(password);

    if (deviceToken) {
      const exDevice = await User.findOne({ where: { device_token: deviceToken } });
      if (exDevice) {
        const exDeviceUserId = exDevice.id;
        await User.update({
          name,
          email,
          password: hashedPwd,
          device_token: null,
        },
        { where: { id: exDeviceUserId } });
        console.log(email, password);
        return res.status(201).json({ result: true, text: '회원전환 성공' });
      }
    }

    await User.create({
      name,
      email,
      password: hashedPwd,
    });

    console.log(email, password);
    return res.status(201).json({ result: true });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const emailConfirm = async (req, res, next) => {
  const { email, auth_num } = req.body;
  try {
    const date = new Date();
    const authData = await AuthNum.findOne({
      where: { email },
    });
    if (authData) {
      const pastDate = authData.updatedAt;
      console.log(`${pastDate}  ${date}`);
      if (pastDate.setMinutes(pastDate.getMinutes() + 5) > date) {
        if (authData.auth == auth_num) {
          await AuthNum.update(
            {
              status: 1,
            },
            {
              where: { email },
            },
          );
          res.json({ result: true });
        } else {
          res
            .status(403)
            .json({ result: false, state: 0, text: '인증 번호가 다릅니다.' });
        }
      } else {
        res
          .status(403)
          .json({ result: false, state: 1, text: '인증 시간 만료' });
      }
    } else {
      res
        .status(403)
        .json({ result: false, state: 2, text: '이메일 인증 필요' });
    }
  } catch {
    console.error(error);
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, pushToken } = req.body;
    console.log(email, password, pushToken);
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      return res.json({ result: false, state: 1, text: '존재하지 않는 id' });
    }

    const userId = user.id;
    const { provider } = user;
    const { name } = user;

    const token = jwt.sign(
      {
        userId,
        email,

        provider,
      },
      secretObj.secret,
      {},
    );

    const result = await hash.compareHash(password, user.password);

    if (result) {
      res.cookie('user', token);
      res.json({
        result: true,
        // userId,
        token,
        // email,
        // provider,
        // name,
      });
      User.update(
        {
          push_token: pushToken,
        },
        {
          where: {
            id: userId,
          },
        },
      );
    } else {
      return res.json({ result: false, state: 0, text: '비밀번호 틀림' });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const guestLogin = async (req, res, next) => {
  const { deviceToken, pushToken } = req.body;
  try {
    const user = await User.findOrCreate({
      where: { device_token: deviceToken },
      defaults: {
        license: 0,
        lang,
        name: 'user',
        user_type: 0,
        push_token: pushToken,
      },
    });

    console.log(user[0].id);

    const userId = user[0].id;
    const provider = 'local';

    const token = jwt.sign(
      {
        userId,
        email: null,
        provider,
      },
      secretObj.secret,
      {
        expiresIn: '365d',
      },
    );

    res.cookie('user', token);
    res.json({
      result: true,
      userId,
      token,
      email: null,
      provider,
      name: 'user',
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const logout = (req, res, next) => {
  const { pushToken = "" } = req.body;
  try {
    const exUser = User.findOne({
      where: {
        id: req.decoded.userId,
      },
    });

    if (exUser && exUser.push_token === pushToken) {
      User.update(
        {
          push_token: null,
        },
        {
          where: {
            id: req.decoded.userId,
          },
        },
      );
    }

    return res
      .cookie('user', '')
      .json({ result: true, text: 'logout Success' });
  } catch {
    console.error(error);
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const exUser = await User.findOne({ where: { id: req.decoded.userId } });

    if (!exUser) {
      return res
        .status(403)
        .json({ result: false, state: 0, text: '존재하지 않는 아이디' });
    }
    await exUser.destroy();
    return res
      .cookie('user', '')
      .json({ result: true, text: '회원탈퇴 하였습니다' });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const findPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body; // email 토큰에서 쓰기
    const exAuth = await AuthNum.findOne({ where: { email } });
    const exUser = await User.findOne({ where: { email } });

    if (!exUser) {
      return res
        .status(403)
        .json({ result: false, state: 0, text: '존재하지 않는 아이디' });
    } if (!exAuth || exAuth.status != 1) {
      return res
        .status(403)
        .json({ result: false, state: 1, text: '이메일 인증 필요' });
    }
    const hashedPwd = await hash.getHash(newPassword);
    await User.update(
      {
        password: hashedPwd,
      },
      {
        where: { email },
      },
    );

    return res.status(201).json({ result: true, text: '비밀번호 변경 성공' });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.decoded.userId },
    })
    let whereOption;
    if (user.user_type === 0) {
      whereOption = { user_id: user.id };
      const exPosts = await Post.findAll({
        where : whereOption
      });
      let pushCount = 0;
      for (const exPost of exPosts){
        let tempCount = exPost.comment_count - exPost.user_read
        if(tempCount > 0) pushCount += tempCount;
      }
      await User.update({
        push_count : pushCount
      }, {
        where: {
          id: req.decoded.userId
      } });
    } else if (user.user_type === 1 || user.user_type > 400) {
      whereOption = { doc_id: user.id };
      const exPosts = await Post.findAll({
        where : whereOption
      });
      let pushCount = 0;
      for (const exPost of exPosts){
        let tempCount = exPost.comment_count - exPost.doc_read
        if(tempCount > 0) pushCount += tempCount;
      }
      await User.update({
        push_count : pushCount
      }, {
        where: {
          id: req.decoded.userId
      } });
    } else {
      whereOption = { codoc_id: user.id };
      const exPosts = await Post.findAll({
        where : whereOption
      });
      let pushCount = 0;
      for (const exPost of exPosts){
        let tempCount = exPost.comment_count - exPost.codoc_read
        if(tempCount > 0) pushCount += tempCount;
      }
      await User.update({
        push_count : pushCount
      }, {
        where: {
          id: req.decoded.userId
      } });
    }
    const userId = user.id;
    const { email } = user;
    const { provider } = user;
    const badgeCount = user.push_count;
    
    const token = jwt.sign(
      {
        userId,
        email,
        provider,
      },
      secretObj.secret,
      {
        expiresIn: '365d',
      },
    );
    const { pushToken } = req.body;
    console.log(`refresh : ${pushToken}`);
    res.cookie('user', token);
    await User.update({
      push_token: pushToken,
    }, {
      where: {
        id: req.decoded.userId,
      },
    });
    res.json({
      result: true,
      userId,
      token,
      email,
      provider,
      badgeCount,
    });
  } catch (error) {
    console.log(error);
    res.json({ result: false, text: '존재하지 않는 계정입니다.' });
  }
};

module.exports = {
  join,
  emailConfirm,
  login,
  guestLogin,
  logout,
  deleteUser,
  findPassword,
  refresh,
};


// router.post('/kakao', async (req, res, next) => {
//   const { accessToken } = req.body;
//   console.log(accessToken);

//   const getUserData = async () => {
//     try {
//       return axios.get('https://kapi.kakao.com/v2/user/me', {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   try {
//     const profile = await getUserData();
//     console.log(profile.data);

//     const exUser = await User.findOne({ where: { sns_id: profile.data.id } });
//     if (exUser) {
//       console.log(exUser.user_type);
//       if (exUser.user_type == null) {
//         return res.json({
//           result: true,
//           sns_id: profile.data.id,
//           state: 0,
//           text: 'userType, name 인증 필요',
//         });
//       }

//       const userId = exUser.id;
//       const userType = exUser.user_type;
//       const provider = exUser.provider;
//       const name = exUser.name;
//       const email = exUser.email;

//       const token = jwt.sign(
//         {
//           userId,
//           email,
//           userType,
//           provider,
//           name,
//         },
//         secretObj.secret,
//         {
//           expiresIn: '365d',
//         },
//       );
//       res.cookie('user', token);
//       res.json({
//         userId,
//         email,
//         userType,
//         provider,
//         name,
//         state: 1,
//         token,
//       });
//     } else {
//       const newUser = await User.create({
//         sns_email: profile.kakao_account && profile.kakao_account.email,
//         sns_id: profile.data.id,
//         provider: 'kakao',
//       });
//       res.json({
//         result: true,
//         sns_id: profile.data.id,
//         state: 0,
//         text: 'userType, name 인증 필요',
//       });
//     }
//   } catch {
//     return res
//       .status(403)
//       .json({ result: false, state: 1, text: '잘못된 인증' });
//   }
// });

// router.post('/usertype', async (req, res, next) => {
//   const { snsId, userType, name } = req.body;
//   console.log(snsId, userType, name);
//   try {
//     const exUser = await User.findOne({ where: { sns_id: snsId } });
//     if (exUser) {
//       await User.update(
//         {
//           user_type: userType,
//           name,
//         },
//         {
//           where: { sns_id: snsId },
//         },
//       );

//       const userId = exUser.id;
//       const userType = exUser.dataValues.user_type;
//       const provider = exUser.dataValues.provider;
//       const name = exUser.dataValues.name;
//       const email = exUser.dataValues.email;

//       const token = jwt.sign(
//         {
//           userId,
//           email,
//           userType,
//           provider,
//           name,
//         },
//         secretObj.secret,
//         {
//           expiresIn: '365d',
//         },
//       );

//       res.cookie('user', token);
//       console.log(exUser);

//       res.json({
//         userId,
//         email,
//         userType,
//         provider,
//         name,
//         state: 1,
//         token,
//       });
//     } else {
//       return res
//         .status(403)
//         .json({ result: false, state: 0, text: '로그인 먼저 하시오' });
//     }
//   } catch {
//     return res
//       .status(403)
//       .json({ result: false, state: 1, text: '잘못된 인증' });
//   }
// });

