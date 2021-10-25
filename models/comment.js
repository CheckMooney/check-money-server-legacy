const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        text: {
          type: Sequelize.TEXT,
          validate: {
            len: [0, 200],
          },
          allowNull: false,
        },
        english: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        translation: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        img_url: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        sys: {
          type: Sequelize.INTEGER,
          allowNull: true,
          default: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'Comment',
        tableName: 'comments',
        paranoid: true,
        underscored: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      },
    );
  }

  static associate(db) {
    db.Comment.belongsTo(db.Post, {
      foreignKey: 'post_id',
      targetKey: 'id',
      as: 'post',
    });
    db.Comment.belongsTo(db.User, {
      allowNull: true,
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'user',
    });
  }
};
