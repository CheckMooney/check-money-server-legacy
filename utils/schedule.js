const schedule = require('node-schedule');
const { Account, Transaction , User, Sequelize, sequelize } = require('../models');
const { firebasePushToUserId } = require('../utils/push');
exports.setSchedule = () => {
    const job = schedule.scheduleJob('18 * * *', () => {
        const date = new Date();
        const day = date.getDate();
        Transaction.findAll({
            where : {
            [Sequelize.Op.and] : [sequelize.where(sequelize.fn('DAY', sequelize.col('date')), day)],
              type: 1,
            },
            attributes: ["id","is_consumption", "price", "detail", "date" , "category", "account_id" ],
            include : [{
              model: Account,
              as: 'account',
              required: true,
              attributes: ['id', 'user_id'],
            }]
          }).then(
              async (transactions) => {
                  for (const transaction of transactions) {
                      await Transaction.create({
                          is_consumption: transaction.is_consumption,
                          price: transaction.price,
                          detail: transaction.detail,
                          date: date.toString(),
                          category: transaction.category,
                          account_id: transaction.account_id,
                      })
                      await firebasePushToUserId(
                        {
                            title: 'Check money 자동 지출',
                            body: transaction.detail + ' ' +transaction.price,
                        },
                        {
                            result: 'true',
                            time: date,
                        },
                        [transaction.account.user_id]
                      )
                  }
              }
          ).catch(
              (error) => {
                  console.error(error);
              }
          )
    });
}