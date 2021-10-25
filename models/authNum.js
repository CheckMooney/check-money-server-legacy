const Sequelize = require('sequelize');

module.exports = class AuthNum extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        auth: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        status: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'AuthNum',
        tableName: 'auth_nums',
        underscored: true,
        paranoid: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
      },
    );
  }
};
