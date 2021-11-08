const Sequelize = require('sequelize');

module.exports = class Account extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          validate: {
            len: [0, 1000],
          },
          allowNull: false,
        },
        // state: {
        //   type: Sequelize.INTEGER,
        //   allowNull: true,
        //   defaultValue: 0,
        // },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'Account',
        tableName: 'accounts',
        paranoid: true,
        underscored: true,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      },
    );
  }

  static associate(db) {
    db.Account.hasMany(db.Transaction);
    // db.Post.hasMany(db.PostImg);
    db.Account.belongsTo(db.User, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'user',
    });
  }
};
