// const models = require('../models');

// const sendFileName = (req, res) => {
//   console.log(req.file);
//   res.json({ result: true, url: `/img/${req.file.filename}` });
// };

// const getCommentList = async (req, res, next) => {
//   let post_id = req.params.postId;
//   try {
//     let { page = 1, limit = 99 } = req.query;
//     page = Number.parseInt(page);
//     limit = Number.parseInt(limit);
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

// module.exports = { sendFileName, getCommentList };
