const { transporter } = require('../config/emailConfig');
const path = require('path');
const { User, AuthNum } = require('../models');

const genRandom = function (min, max) {
  let ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return ranNum;
};

exports.sendEmailToJoin = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    if(!email){
      res.status(400).json({
        "result" : false,
        "code" : 40400, 
        "message": "VALIDATION_ERROR"
      });
    }

    const authNum = genRandom(111111, 999999);
    let emailTemplete =  JSON.stringify({ authCode: authNum });

    let exUser = await User.findOne({ where: { email }, paranoid: false });
    if (exUser) {
      if (exUser.isSoftDeleted) {
        return res.status(400).json({
          "result" : false,
          "code" : 40001, 
          "message": "WITHDRAWN"
        });
      }
      return res.status(400).json({
        "result" : false,
        "code" : 40002, 
        "message": "ALREADY_EXIST"
      });
    }

    const exAuth = await AuthNum.findOne({ where: { email } });
    if (exAuth) {
      await AuthNum.update(
        {
          auth: authNum,
        },
        {
          where: { email },
        },
      );
    } else {
      const postCreated = await AuthNum.create({
        auth: authNum,
        email,
      });
    }

    const mailOptions = {
      from: 'check money',
      to: email,
      subject: '[check money] Please verify your email address',
      html: emailTemplete,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Finish sending email : ' + info.response);
    res.send({ 
      result : true,
      code : 20000, 
      message: "OK"
    });
    transporter.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      "result" : false,
      "code" : 50000, 
      "message": "ERROR"
    });
  }
};

exports.sendEmailForPwd = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const authNum = genRandom(111111, 999999);
    let emailTemplete =  JSON.stringify({ authCode: authNum });

    let exUser = await User.findOne({ where: { email } });
    console.log(exUser.deletedAt);
    if (!exUser) {
      return res
        .status(404)
        .json({ result: false, text: '존재하지 않는 이메일 계정입니다' });
    }

    const exAuth = await AuthNum.findOne({ where: { email } });
    if (exAuth) {
      const postUpdated = await AuthNum.update(
        {
          auth: authNum,
        },
        {
          where: { email },
        },
      );
    } else {
      const postCreated = await AuthNum.create({
        auth: authNum,
        email,
      });
    }

    const mailOptions = {
      from: 'check money',
      to: email,
      subject: '[check money] Please verify your email address',
      html: emailTemplete,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Finish sending email : ' + info.response);
    res.send({ result: true });
    transporter.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({ result: false, text: '이메일 전송 실패' });
  }
};
