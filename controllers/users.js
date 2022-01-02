const { User, LicenseImg, Inquiry } = require('../models');
const hash = require('../utils/hash');

const sendFileName = (req, res) => {
  res.json({       
    "result" : true,
    "code" : 20000, 
    "message": "OK",
    url: `/img/${req.file.filename}` 
  });
};

const getMyInfo = async (req, res, next) => {
  try {
    // console.log(req.decoded);//?
    const user = await User.findOne({
      attributes: { exclude: ['password', 'online', 'push_token', 'device_token', 'sns_id', 'sns_email', 'push_alarm', 'createdAt','updatedAt','deletedAt'] },
      where: { id: req.decoded.user_id },
    });
    res.json({
      "result" : true,
      "code" : 20000, 
      "message": "OK",
      ...user.dataValues,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const modifyMyInfo = async (req, res, next) => {
  try {
    const {
      img_url,
      name,
      password,
      new_password,
      push_alarm,
    } = req.body;
    const id = req.decoded.user_id;

    let updateObj = {};
    if (img_url || img_url === '') {
      updateObj.img_url = img_url;
    }
    if (name) updateObj.name = name;
    if (push_alarm || push_alarm === 0) updateObj.push_alarm = push_alarm;


    const exUser = await User.findOne({
      where: { id },
    });
    if (exUser) {
      if (password) {
        const result = await hash.compareHash(password, exUser.password);
        if (result) {
          const hashedPwd = await hash.getHash(new_password);
          updateObj.password = hashedPwd;
          await User.update(updateObj, {
            where: { id },
          });
        } else {
          return res.status(400).json({
            "result" : false,
            "code" : 40008, 
            "message": "INCORRECT_PASSWORD"
          });
        }
      } else if (password === '') {
        return res.status(400).json({
          "result" : false,
          "code" : 40008, 
          "message": "INCORRECT_PASSWORD"
         });
      } else {
        await User.update(updateObj, {
          where: { id },
        });
      }
    } else {
      return res
        .status(400)
        .json({
          "result" : false,
          "code" : 40007, 
          "message": "USER_NOT_FOUND"
        });
    }

    return res.json({
      "result" : true,
      "code" : 20000, 
      "message": "OK",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  sendFileName,
  getMyInfo,
  modifyMyInfo,
};
