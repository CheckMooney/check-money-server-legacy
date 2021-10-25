const Sequelize = require('sequelize');
const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');
const AuthNum = require('./authNum');
const PostImg = require('./postImg');

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
db.Post = Post;
db.Comment = Comment;
db.AuthNum = AuthNum;
db.PostImg = PostImg;


User.init(sequelize);
Post.init(sequelize);
Comment.init(sequelize);
AuthNum.init(sequelize);
PostImg.init(sequelize);

User.associate(db);
Post.associate(db);
Comment.associate(db);
PostImg.associate(db);

module.exports = db;
