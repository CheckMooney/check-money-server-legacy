const { Account, Transaction , User, Sequelize } = require('../models');

exports.getAccounts = async (req, res, next) => {
  try{
    let { page = 1, limit = 10} = req.query;
    page = Number(page);
    limit = Number(limit);
    if (limit > 10000) limit = 9999;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const {rows, count} = await Account.findAndCountAll({
      where : {
        user_id: req.decoded.user_id
      },
      distinct: true,
      limit,
      offset,
      attributes : ["id", "title", "description", "createdAt" ]
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

// exports.getAccountDetail =  (req, res) => {
// }

exports.createAccount = async (req, res, next) => {
  try{
    const { title = "내 지갑", description = ""} = req.body;

    const account = await Account.create({
      title,
      description,
      user_id: req.decoded.user_id
    })

    res.json({
      "result" : true,
      "code" : 20000, 
      "message": "OK",
      "id": account.id,
    });
  }catch(error) {
    console.error(error);
    next(error);
  }
}

exports.updateAccount = async (req, res, next) => {
  try{
    const { title , description } = req.body;
    const { accountId } = req.params;

    await Account.update({
      ...(title ? {title} : {}),
      ...(description ? {description} : {}),
    },{
      where: { id : accountId}
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
}

exports.deleteAccount = async (req, res, next) => {
  try{
    const { accountId } = req.params;

    await Account.destroy({
      where: { id : accountId}
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
}

exports.getTransactions = async (req, res, next) => {
  try{
    let { page = 1, limit = 10} = req.query;
    page = Number(page);
    limit = Number(limit);
    if (limit > 1000) limit = 999;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const { accountId } = req.params
    let {column = 'date', direction='ASC', category, is_consumption, date} = req.query;

    if (column !== 'date' && column !== 'category' && column !== 'is_consumption' ) {
      column= 'date'
    }
    if (direction !== 'ASC' && direction !== 'DESC') {
      direction= 'ASC'
    }
    // date = '2021'
    const {rows, count} = await Transaction.findAndCountAll({
      where : {
        account_id: accountId,
        type: 0,
        ...(is_consumption ? {is_consumption} : {}),
        ...(category ? {category} : {}),
        ...(date ? {date : {[Sequelize.Op.substring]: date}} : {}),
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

exports.getSubscriptions = async (req, res, next) => {
  try{
    let { page = 1, limit = 10} = req.query;
    page = Number(page);
    limit = Number(limit);
    if (limit > 100) limit = 99;
    const offset = page > 1 ? (page - 1) * limit : 0;
    const { accountId } = req.params
    let {column = 'createdAt', direction='ASC'} = req.query;

    const {rows, count} = await Transaction.findAndCountAll({
      where : {
        account_id: accountId,
        type: 1,
        // ...(is_consumption ? {is_consumption} : {}),
        // ...(category ? {category} : {}),
        // ...(date ? {date : {[Sequelize.Op.substring]: date}} : {}),
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

exports.createSubscriptions = async (req, res, next) => {
  try{
    const {         
      is_consumption = 1,
      price = 0,
      detail = "",
      date,
      category = 0,
      // account_id
    } = req.body;

    const { accountId } = req.params

    const transaction = await Transaction.create({
      is_consumption,
      price,
      detail,
      date,
      category,
      account_id : accountId,
      type: 1
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
}

exports.updateSubscriptions = async (req, res, next) => {
  try{
    const {         
      is_consumption,
      price,
      detail,
      date,
      category,
      } = req.body;
    const { subscriptionId } = req.params;
    const { accountId } = req.params

    await Transaction.update({
      ...((is_consumption || is_consumption===0 ) ? {is_consumption} : {}),
      ...(price ? {price} : {}),
      ...(detail ? {detail} : {}),
      ...(date ? {date} : {}),
      ...(category ? {category} : {}),
      account_id : accountId,
      },{
      where: { id : subscriptionId }
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
}

exports.deleteSubscriptions = async (req, res, next) => {
  try{
    const { subscriptionId } = req.params;
    const { accountId } = req.params

    await Transaction.destroy({
      where: { 
        id : subscriptionId,
        account_id : accountId,
      }
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
}
