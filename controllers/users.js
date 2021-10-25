const { User, LicenseImg, Inquiry } = require('../models');
const hash = require('../utils/hash');

const sendFileName = (req, res) => {
  res.json({ result: true, url: `/img/${req.file.filename}` });
};

const getMyInfo = async (req, res, next) => {
  try {
    console.log(req.decoded);//
    const user = await User.findOne({
      attributes: { exclude: ['password', 'online', 'push_token', 'device_token'] },
      where: { id: req.decoded.userId },
      include: [
        {
          model: LicenseImg,
          required: false,
        },
      ],
    });
    res.json({
      result: user,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getUserInfo = async (req, res, next) => {
  let id = req.params.userid;
  try {
    const user = await User.findOne({
      attributes: {
        exclude: [
          'id',
          'password',
          'online',
          'push_token',
          'push_alarm',
          'device_token',
          'email_alarm',
          'license',
          'updatedAt',
          'createdAt',
          'deletedAt',
        ],
      },
      where: { id },
    });

    res.json({
      result: user,
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
      about_me,
      password,
      newPassword,
      height,
      weight,
      gender,
      blood,
      birth_year,
      push_alarm,
      email_alarm,
      lang,
    } = req.body;
    const id = req.decoded.userId;

    let updateObj = {};
    if (img_url || img_url === '') {
      updateObj.img_url = img_url;
    }
    if (name) updateObj.name = name;
    if (about_me) updateObj.about_me = about_me;
    if (height) updateObj.height = height;
    if (weight) updateObj.weight = weight;
    if (gender || gender === 0) updateObj.gender = gender;
    if (blood) updateObj.blood = blood;
    if (birth_year) updateObj.birth_year = birth_year;
    if (push_alarm || push_alarm === 0) updateObj.push_alarm = push_alarm;
    if (email_alarm || email_alarm === 0) updateObj.email_alarm = email_alarm;
    if (lang) updateObj.lang = lang;

    const exUser = await User.findOne({
      where: { id },
    });
    if (exUser) {
      if (password) {
        const result = await hash.compareHash(password, exUser.password);
        if (result) {
          const hashedPwd = await hash.getHash(newPassword);
          updateObj.password = hashedPwd;
          await User.update(updateObj, {
            where: { id },
          });
        } else {
          return res.status(403).json({ result: false, text: '비밀번호 틀림' });
        }
      } else if (password === '') {
        return res.status(403).json({ result: false, text: '비밀번호 틀림' });
      } else {
        await User.update(updateObj, {
          where: { id },
        });
      }
    } else {
      return res
        .status(403)
        .json({ result: false, state: 1, text: '존재하지 않는 아이디' });
    }

    return res.json({ result: true, text: '개인정보 변경 성공' });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const modifyMyMajor = async (req, res, next) => {
  try {
    const { userType, subType } = req.body;
    const id = req.decoded.userId;

    let updateObj = {};
    if (userType) updateObj.user_type = userType;
    if (subType) updateObj.sub_type = subType;
    // updateObj.license = 1;

    if (userType < 3 || userType > 400)
      return res.json({ result: false, text: '변경가능한 전공이 아닙니다' });

    const exUser = await User.findOne({
      where: { id },
    });

    if (exUser) {
      await User.update(
        { license: 1 },
        {
          where: { id },
        },
      );
    } else {
      return res
        .status(403)
        .json({ result: false, state: 1, text: '존재하지 않는 아이디' });
    }

    updateObj.sys = 1;
    updateObj.active = 1;
    updateObj.user_id = id;

    let exInquiry = await Inquiry.findOne({ where: { user_id: id, sys: 1 } });
    if (exInquiry) {
      await Inquiry.update(updateObj, { where: { user_id: id, sys: 1 } });
    } else {
      await Inquiry.create(updateObj);
    }

    return res.json({ result: true, text: '전공 변경 신청 성공' });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  sendFileName,
  getMyInfo,
  getUserInfo,
  modifyMyInfo,
  modifyMyMajor,
};
