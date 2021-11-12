const { Account, Transaction , User, Sequelize } = require('../models');

// const sendFileName = (req, res) => {
//   console.log(req.file);
//   res.json({ result: true, url: `/img/${req.file.filename}` });
// };

// exports.getCommentList = async (req, res, next) => {
//   let post_id = req.params.postId;
//   try {
//     let { page = 1, limit = 99 } = req.query;
//     page = Number(page);
//     limit = Number(limit);
//     if (limit > 100) limit = 99;
//     const offset = page > 1 ? (page - 1) * limit : 0;

//     const comments = await models.Comment.findAndCountAll({
//       where: { post_id },
//       limit,
//       offset,
//       order: [['createdAt', 'DESC']],
//       include: [
//         {
//           model: models.User,
//           as: 'user',
//           attributes: ['id', 'name', 'img_url', 'user_type'],
//           required: false,
//         },
//       ],
//     });
//     res.json({
//       result: true,
//       list: comments.rows,
//       count: comments.count,
//     });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };

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

        //account_id valiation
  
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
    ...(is_consumption ? {is_consumption} : {}),
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
