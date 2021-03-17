const Sequelize = require('sequelize');
const User = require('./user');
const Forum = require('./forum');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
db.Forum = Forum;

User.init(sequelize);
Forum.init(sequelize);

User.associate(db);
Forum.associate(db);

module.exports = db;
