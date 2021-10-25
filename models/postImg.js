const Sequelize = require('sequelize');

module.exports = class PostImg extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        img_url: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'PostImg',
        tableName: 'post_imgs',
        paranoid: false,
        underscored: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      },
    );
  }

  static associate(db) {
    db.PostImg.belongsTo(db.Post, {
      foreignKey: 'post_id',
      targetKey: 'id',
      as: 'postimg',
    });
  }
};
