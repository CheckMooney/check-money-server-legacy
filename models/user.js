const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(320),
          allowNull: true,
          unique: true,
        },
        device_token: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        name: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        push_token: {
          type: Sequelize.STRING(300),
          allowNull: true,
        },
        push_alarm: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 1,
        },
        img_url: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'local',
        },
        sns_id: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        sns_email: {
          type: Sequelize.STRING(100),
          allowNull: true,
          unique: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'User',
        tableName: 'users',
        paranoid: true, //true
        underscored: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      },
    );
  }

  static associate(db) {
    db.User.hasMany(db.Post);
    db.User.hasMany(db.Comment);
  }
};
