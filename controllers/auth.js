const jwt = require('jsonwebtoken');
const { User, AuthNum } = require('../models');
const hash = require('../utils/hash');
const google = require('../utils/google');

const join = async (req, res, next) => {
  let {
    name, email, password, deviceToken,
  } = req.body;

  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res
        .status(400)
        .json({
          "result" : false,
          "code" : 40002, 
          "message": "ALREADY_EXIST"
        });
    }

    const exAuth = await AuthNum.findOne({ where: { email } });
    if (!exAuth || exAuth.status !== 1) {
      return res
        .status(400)
        .json({
          "result" : false,
          "code" : 40006, 
          "message": "EMAIL_COMFIRM_NEEDED"
        });
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
        return res.status(200).json({
          "result" : true,
          "code" : 20000, 
          "message": "OK"
        });
      }
    }

    await User.create({
      name,
      email,
      password: hashedPwd,
    });

    console.log(email, password);
    return res.status(200).json({
      "result" : true,
      "code" : 20000, 
      "message": "OK"
    });
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
          res.json({
            result: true,
            code : 20000, 
            message: "OK",
          });
        } else {
          res
            .status(400)
            .json({
              "result" : false,
              "code" : 40003, 
              "message": "INCORRECT_AUTH_NUM"
            });
        }
      } else {
        res
          .status(400)
          .json({
            "result" : false,
            "code" : 40004, 
            "message": "EXPIRED"
          });
      }
    } else {
      res
        .status(400)
        .json({
          "result" : false,
          "code" : 40005, 
          "message": "EMAIL_AUTH_NEEDED"
        });
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
      return res
      .status(400)
      .json({
        "result" : false,
        "code" : 40007, 
        "message": "USER_NOT_FOUND"
      });
    }

    const userId = user.id;
    const { provider } = user;

    const token = jwt.sign(
      {
        userId,
        email,
        provider,
      },
      process.env.JWT_SECRET,
      {},
    );
    const refresh_token = jwt.sign(
      {
        userId,
        email,
        provider,
      },
      process.env.REFRESH_JWT_SECRET,
      {},
    );

    if (await hash.compareHash(password, user.password)) {
      res.cookie('user', token);
      res.json({
        result: true,
        code : 20000, 
        message: "OK",
        token,
        refresh_token
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
      return res
      .status(400)
      .json({
        "result" : false,
        "code" : 40008, 
        "message": "INCORRECT_PASSWORD"
      });
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

const googleLogin = async (req, res, next) => {
  const { id_token } = req.body;
  try {
    const payload = await google.verify(id_token);
    console.log(payload);
    if (!payload) {
      return res
      .status(400)
      .json({
        "result" : false,
        "code" : 40009, 
        "message": "OAUTH_FAIL"
      });
    }

    let exUser = await User.findOne({ where: { sns_id: payload.sub } });

    if (!exUser) {
      exUser = await User.create({
        sns_email: payload.email,
        sns_id: payload.sub,
        provider: 'google',
        img_url: payload.picture,
        name: payload.name || 'defalt name',
      });
    }

    const userId = exUser.id;
    const provider = exUser.dataValues.provider;
    const email = exUser.dataValues.email;

    const token = jwt.sign(
      {
        userId,
        email,
        provider,
      },
      process.env.JWT_SECRET,
      {},
    );
    const refresh_token = jwt.sign(
      {
        userId,
        email,
        provider,
      },
      process.env.REFRESH_JWT_SECRET,
      {},
    );

    res.cookie('user', token);
    res.json({
      result: true,
      code : 20000, 
      message: "OK",
      token,
      refresh_token
    });
  } catch (error) {
    console.error(error);
    res
    .status(400)
    .json({
      "result" : false,
      "code" : 40009, 
      "message": "OAUTH_FAIL"
    });
  }
}

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
    const { user_id, refresh_token } = req.body;
    
    let decoded = jwt.verify(refresh_token, process.env.REFRESH_JWT_SECRET);

    const userId = decoded.userId;
    console.log(decoded);
    const user = await User.findOne({
      where: { id: userId },
    });

    const new_access_token = jwt.sign(
      {
        userId,
        email: user.email,
        provider: user.provider,
      },
      process.env.JWT_SECRET,
      {},
    );
    const new_refresh_token = jwt.sign(
      {
        userId,
        email: user.email,
        provider: user.provider,
      },
      process.env.REFRESH_JWT_SECRET,
      {},
    );

    res.cookie('user', token);
    res.json({
      result: true,
      code : 20000, 
      message: "OK",
      access_token : new_access_token,
      refresh_token: new_refresh_token
    });
    // User.update(
    //   {
    //     push_token,
    //   },
    //   {
    //     where: {
    //       id: userId,
    //     },
    //   },
    // );

  } catch (error) {
    console.error(error);
    return next(error);
  }
};
// const refresh = async (req, res, next) => {
//   try {
//     const user = await User.findOne({
//       where: { id: req.decoded.userId },
//     })
//     let whereOption;
//     if (user.user_type === 0) {
//       whereOption = { user_id: user.id };
//       const exPosts = await Post.findAll({
//         where : whereOption
//       });
//       let pushCount = 0;
//       for (const exPost of exPosts){
//         let tempCount = exPost.comment_count - exPost.user_read
//         if(tempCount > 0) pushCount += tempCount;
//       }
//       await User.update({
//         push_count : pushCount
//       }, {
//         where: {
//           id: req.decoded.userId
//       } });
//     } else if (user.user_type === 1 || user.user_type > 400) {
//       whereOption = { doc_id: user.id };
//       const exPosts = await Post.findAll({
//         where : whereOption
//       });
//       let pushCount = 0;
//       for (const exPost of exPosts){
//         let tempCount = exPost.comment_count - exPost.doc_read
//         if(tempCount > 0) pushCount += tempCount;
//       }
//       await User.update({
//         push_count : pushCount
//       }, {
//         where: {
//           id: req.decoded.userId
//       } });
//     } else {
//       whereOption = { codoc_id: user.id };
//       const exPosts = await Post.findAll({
//         where : whereOption
//       });
//       let pushCount = 0;
//       for (const exPost of exPosts){
//         let tempCount = exPost.comment_count - exPost.codoc_read
//         if(tempCount > 0) pushCount += tempCount;
//       }
//       await User.update({
//         push_count : pushCount
//       }, {
//         where: {
//           id: req.decoded.userId
//       } });
//     }
//     const userId = user.id;
//     const { email } = user;
//     const { provider } = user;
//     const badgeCount = user.push_count;
    
//     const token = jwt.sign(
//       {
//         userId,
//         email,
//         provider,
//       },
//       secretObj.secret,
//       {
//         expiresIn: '365d',
//       },
//     );
//     const { pushToken } = req.body;
//     console.log(`refresh : ${pushToken}`);
//     res.cookie('user', token);
//     await User.update({
//       push_token: pushToken,
//     }, {
//       where: {
//         id: req.decoded.userId,
//       },
//     });
//     res.json({
//       result: true,
//       userId,
//       token,
//       email,
//       provider,
//       badgeCount,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({ result: false, text: '존재하지 않는 계정입니다.' });
//   }
// };

module.exports = {
  join,
  emailConfirm,
  login,
  guestLogin,
  logout,
  deleteUser,
  findPassword,
  refresh,
  googleLogin
};
