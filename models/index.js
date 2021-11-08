const Sequelize = require('sequelize');
const User = require('./user');
const Account = require('./account');
const Transaction = require('./transaction');
const AuthNum = require('./authNum');


const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
db.Account = Account;
db.Transaction = Transaction;
db.AuthNum = AuthNum;
// db.PostImg = PostImg;


User.init(sequelize);
Account.init(sequelize);
Transaction.init(sequelize);
AuthNum.init(sequelize);
// PostImg.init(sequelize);

User.associate(db);
Account.associate(db);
Transaction.associate(db);
// PostImg.associate(db);

module.exports = db;
