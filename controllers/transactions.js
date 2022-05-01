const { Account, Transaction , User, Sequelize } = require('../models');

exports.getTransactions = async (req, res, next) => {
  try{
    let { page = 1, limit = 10} = req.query;
    page = Number(page);
    limit = Number(limit);
    if (limit > 1000) limit = 999;
    const offset = (page > 1) ? ((page - 1) * limit) : 0;

    let {column = 'date', direction='ASC', account_id, category, is_consumption, date} = req.query;

    if (column !== 'date' && column !== 'category' && column !== 'is_consumption' ) {
      column= 'date'
    }
    if (direction !== 'ASC' && direction !== 'DESC') {
      direction= 'ASC'
    }
    
    const {rows, count} = await Transaction.findAndCountAll({
      where : {
        ...(account_id ? {account_id} : {}),
        ...(is_consumption ? {is_consumption} : {}),
        ...(category ? {category} : {}),
        ...(date ? {date : {[Sequelize.Op.substring]: date}} : {}),
        type: 0
      },
      distinct: true,
      limit,
      offset,
      order: [[column, direction]],
      attributes: ["id","is_consumption", "price", "detail", "date" , "category", "account_id" ],
      include : [{
        model: Account,
        as: 'account',
        required: true,
        attributes: [],
        where: {user_id : req.decoded.user_id}
      }]
    })

    res.json({
      "result" : true,
      "code" : 20000, 
      "message": "OK",
      "rows": rows,
      "count" : count  
    });
  }catch(error) {
    console.error(error);
    next(error);
  }
}

exports.createTransaction = async (req, res, next) => {
    try{
      const {         
        is_consumption,
        price = 0,
        detail = "",
        date,
        category = 0,
        account_id
        } = req.body;

        //TODO account_id valiation
  
      const transaction = await Transaction.create({
        is_consumption,
        price,
        detail,
        date,
        category,
        account_id
      })
  
      res.json({
        "result" : true,
        "code" : 20000, 
        "message": "OK",
        "id": transaction.id,
      });
    }catch(error) {
      console.error(error);
      next(error);
    }
};

exports.updateTransaction = async (req, res, next) => {
try{
    const {         
        is_consumption,
        price,
        detail,
        date,
        category,
        } = req.body;
    const { transactionId } = req.params;

    await Transaction.update({
    ...((is_consumption || is_consumption===0 ) ? {is_consumption} : {}),
    ...(price ? {price} : {}),
    ...(detail ? {detail} : {}),
    ...(date ? {date} : {}),
    ...(category ? {category} : {}),
    },{
    where: { id : transactionId}
    })

    res.json({
    "result" : true,
    "code" : 20000, 
    "message": "OK",
    });
}catch(error) {
    console.error(error);
    next(error);
}
};

exports.deleteTransaction = async (req, res, next) => {
try{
    const { transactionId } = req.params;

    await Transaction.destroy({
    where: { id : transactionId}
    })

    res.json({
    "result" : true,
    "code" : 20000, 
    "message": "OK",
    });
}catch(error) {
    console.error(error);
    next(error);
}
};
