const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        title_translation: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        title_english: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        body: {
          type: Sequelize.TEXT,
          validate: {
            len: [0, 1000],
          },
          allowNull: false,
        },
        translation: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        english: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        doc_description: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        codoc_maj: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        img_url: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        state: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        active: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 1,
        },
        comment_count: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        commented_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        user_read: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        doc_read: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        codoc_read: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'Post',
        tableName: 'posts',
        paranoid: true,
        underscored: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      },
    );
  }

  static associate(db) {
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.PostImg);
    db.Post.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'user',
    });
    db.Post.belongsTo(db.User, {
      foreignKey: { name: 'doc_id', allowNull: true },
      targetKey: 'id',
      as: 'doc',
    });
    db.Post.belongsTo(db.User, {
      foreignKey: { name: 'codoc_id', allowNull: true },
      targetKey: 'id',
      as: 'codoc',
    });
  }
};
