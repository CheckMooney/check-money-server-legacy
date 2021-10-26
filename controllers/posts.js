const { User, Post, PostImg, Comment, Sequelize } = require('../models');
const holderText = `Where does it hurt? If you write down the symptoms you are experiencing in detail, Happy doctor will provide you with detailed medical advice. If you want, you can take a picture of the affected area and attach it as a picture. (Happy doctor's medical consultation is free of charge, and answers are made by a doctor-licensed specialist. However, for accurate diagnosis and prescription, it is recommended that you seek medical attention.)`

const sendFileNames = (req, res) => {
  console.log(req.files);
  const filenames = [];
  for (const file of req.files) {
    filenames.push(`/img/${file.filename}`);
  }
  res.json({ result: true, urls: filenames });
};

// const getHolderText = async (req, res, next) => {
//   const lang = req.params.lang;
//   try {
//     try{
//       if(!lang){ lang = 'en' }
//       let holderTranslation = await getTranslation(holderText, lang);
//       holderTranslation = holderTranslation[0].translatedText;
//       res.json({ result: true, holderText, holderTranslation })
//     }catch{
//       res.json({ result: true, holderText, holderTranslation : holderText })
//     }
//   } catch {
//     console.log(error);
//     next(error);
//   }
// }
  
const treatRequest = async (req, res, next) => {
  let { title, body, img_url, img_urls } = req.body;
  const regex = /(<([^>]+)>)/gi;
  body = body.replace(regex, '');
  try {
    const [
      { translatedText: title_translation },
      { translatedText: translation },
    ] = await getTranslation([title, body], 'ko');

    const [
      { translatedText: title_english },
      { translatedText: english },
    ] = await getTranslation([title, body], 'en');

    const post = await Post.create({
      title,
      title_translation,
      title_english,
      body,
      translation,
      english,
      user_id: req.decoded.userId,
      img_url,
      state: 0,
      commented_at: Sequelize.fn('NOW'),
    });

    if (img_urls && img_urls.length) {
      for (const imgUrls of img_urls) {
        await PostImg.create({
          post_id: post.id,
          img_url: imgUrls,
        });
      }
    }

    res
      .status(201)
      .json({ result: true, id: post.id, text: '진료 요청 성공입니다.' });
  

    } catch {
    console.log(error);
    next(error);
  }
};

const getTreatRequestList = async (req, res, next) => {
  let { page = 1, limit = 10, id } = req.query;

  page = parseInt(page);
  limit = Number.parseInt(limit);

  if (limit == NaN) {
    return;
  }

  try {
    if (limit > 100) limit = 99;
    // const offset = page > 1 ? (page - 1) * limit : 0;
    const offset = Math.max(page - 1, 0) * limit;

    const posts = await Post.findAndCountAll({
      where: { state: 0, ...(id ? { id } : {}), active: 1 },
      order: [['createdAt', 'DESC']], // column, direction
      distinct: true,
      limit: Math.min(limit, 100),
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'img_url',
            'height',
            'weight',
            'gender',
            'birth_year',
          ],
          required: false,
        },
        {
          model: PostImg,
          attributes: ['img_url'],
          required: false,
        },
      ],
    });

    res.json({
      result: true,
      list: posts.rows,
      count: posts.count,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getTreatAcceptList = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, doc_id, id } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    doc_id = Number.parseInt(doc_id);

    if (limit > 100) limit = 99;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const posts = await Post.findAndCountAll({
      where: {
        ...(id ? { id } : {}),
        ...(doc_id ? { doc_id } : {}),
        state: 1,
        active: 1,
      },
      order: [['createdAt', 'DESC']],
      distinct: true,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'img_url',
            'height',
            'weight',
            'gender',
            'birth_year',
          ],
          required: false,
        },
        {
          model: User,
          as: 'doc',
          attributes: ['name'],
          required: false,
        },
        {
          model: PostImg,
          attributes: ['img_url'],
          required: false,
        },
      ],
    });
    res.json({
      result: true,
      list: posts.rows,
      count: posts.count,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getCoTreatRequestList = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 10,
      codoc_maj,
      doc_id,
      id,
      column = 'createdAt',
      direction = 'DESC',
    } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    if (limit > 100) limit = 99;
    const offset = page > 1 ? (page - 1) * limit : 0;

    console.log(codoc_maj);

    const posts = await Post.findAndCountAll({
      where: {
        state: 2,
        ...(id ? { id } : {}),
        ...(doc_id ? { doc_id } : {}),
        ...(codoc_maj ? { codoc_maj } : {}),
        active: 1,
      },
      order: [[column, direction]],
      distinct: true,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'img_url',
            'height',
            'weight',
            'gender',
            'birth_year',
          ],
          required: false,
        },
        {
          model: User,
          as: 'doc',
          attributes: ['name'],
          required: false,
        },
        {
          model: PostImg,
          attributes: ['img_url'],
          required: false,
        },
      ],
    });
    res.json({
      result: true,
      list: posts.rows,
      count: posts.count,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getCoTreatAcceptList = async (req, res, next) => {
  try {
    // console.log(req.query);
    let { page = 1, limit = 10, codoc_id, id } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    codoc_id = Number.parseInt(codoc_id);

    if (limit > 100) limit = 99;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const posts = await Post.findAndCountAll({
      where: {
        state: 3,
        ...(codoc_id ? { codoc_id } : {}),
        ...(id ? { id } : {}),
        active: 1,
      },
      order: [['createdAt', 'DESC']],
      distinct: true,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'img_url',
            'height',
            'weight',
            'gender',
            'birth_year',
          ],
          required: false,
        },
        {
          model: User,
          as: 'doc',
          attributes: ['name'],
          required: false,
        },
        {
          model: User,
          as: 'codoc',
          attributes: ['name'],
          required: false,
        },
        {
          model: PostImg,
          attributes: ['img_url'],
          required: false,
        },
      ],
    });
    res.json({
      result: true,
      list: posts.rows,
      count: posts.count,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getPostListByUser = async (req, res, next) => {
  try {
    const user_id = req.params.userid;

    let {
      page = 1,
      limit = 10,
      id,
      column = 'commented_at',
      direction = 'DESC',
      active,
    } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    if (limit > 100) limit = 99;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const posts = await Post.findAndCountAll({
      where: { user_id, ...(id ? { id } : {}), ...(active ? { active } : {}) }, // active?
      order: [[column, direction]], // column, direction
      distinct: true,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'img_url',
            'height',
            'weight',
            'gender',
            'birth_year',
          ],
          required: false,
        },
        {
          model: User,
          as: 'doc',
          attributes: ['name'],
          required: false,
        },
        {
          model: User,
          as: 'codoc',
          attributes: ['name'],
          required: false,
        },
        {
          model: PostImg,
          attributes: ['img_url'],
          required: false,
        },
      ],
    });
    res.json({
      result: true,
      list: posts.rows,
      count: posts.count,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getPostListByDoc = async (req, res, next) => {
  try {
    const doc_id = req.params.userid;

    // if (doc_id != req.decoded.userId) console.log('비정상적인 접근');

    let {
      page = 1,
      limit = 10,
      id,
      column = 'commented_at',
      direction = 'DESC',
      active,
    } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    if (limit > 100) limit = 99;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const posts = await Post.findAndCountAll({
      limit,
      offset,
      where: { doc_id, ...(id ? { id } : {}), ...(active ? { active } : {}) },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'img_url',
            'height',
            'weight',
            'gender',
            'birth_year',
          ],
          required: false,
        },
        {
          model: User,
          as: 'doc',
          attributes: ['name'],
          required: false,
        },
        {
          model: User,
          as: 'codoc',
          attributes: ['name'],
          required: false,
        },
        {
          model: PostImg,
          attributes: ['img_url'],
          required: false,
        },
      ],
      order: [[column, direction]],
      distinct: true,
    });

    res.json({
      result: true,
      list: posts.rows,
      count: posts.count,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getPostListByCoDoc = async (req, res, next) => {
  try {
    const codoc_id = req.params.userid;

    let {
      page = 1,
      limit = 10,
      id,
      column = 'commented_at',
      direction = 'DESC',
      active,
    } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    if (limit > 100) limit = 99;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const posts = await Post.findAndCountAll({
      limit,
      offset,
      where: { codoc_id, ...(id ? { id } : {}), ...(active ? { active } : {}) },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'img_url',
            'height',
            'weight',
            'gender',
            'birth_year',
          ],
          required: false,
        },
        {
          model: User,
          as: 'doc',
          attributes: ['name'],
          required: false,
        },
        {
          model: User,
          as: 'codoc',
          attributes: ['name'],
          required: false,
        },
        {
          model: PostImg,
          attributes: ['img_url'],
          required: false,
        },
      ],
      order: [[column, direction]],
      distinct: true,
    });

    res.json({
      result: true,
      list: posts.rows,
      count: posts.count,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getPostList = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, codoc_maj } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    if (limit > 100) limit = 99;
    const offset = page > 1 ? (page - 1) * limit : 0;

    if (codoc_maj) {
      codoc_maj = codoc_maj.split(';');
    }

    const posts = await Post.findAndCountAll({
      limit,
      offset,
      where: { ...(codoc_maj ? { codoc_maj } : {}) },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'img_url',
            'height',
            'weight',
            'gender',
            'birth_year',
          ],
          required: false,
        },
        {
          model: User,
          as: 'doc',
          attributes: ['name'],
          required: false,
        },
        {
          model: User,
          as: 'codoc',
          attributes: ['name'],
          required: false,
        },
        {
          model: PostImg,
          attributes: ['img_url'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    res.json({
      result: true,
      list: posts.rows,
      count: posts.count,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getPostDetail = async (req, res, next) => {
  try {
    const id = req.params.postid;


    const exPost = await Post.findOne({
      where: { id },
    });

    if (!exPost) {
      return res.status(404).json({
        result: false,
        text: '존재 하지 않는 포스트입니다.',
      });
    }
    let readCount = 0;

    if (
      req.decoded.userId != exPost.user_id &&
      req.decoded.userId != exPost.doc_id &&
      req.decoded.userId != exPost.codoc_id
    ) {
      console.log('열람중');
    } else if (req.decoded.userId == exPost.user_id) {
      readCount = exPost.comment_count - exPost.user_read;

      const user_read = exPost.comment_count;
      await Post.update(
        {
          user_read,
        },
        {
          where: { id },
        },
      );
      // await socket.emitToChat({
      //   post_id: exPost.id,
      //   event: 'READ_COMMENT',
      //   comment: {
      //     result: true,
      //     user_id: req.decoded.userId,
      //     post_id: exPost.id,
      //     userType,
      //     readAll: true,
      //   },
      // });
    } else if (req.decoded.userId == exPost.doc_id) {
      readCount = exPost.comment_count - exPost.doc_read;

      const doc_read = exPost.comment_count;
      await Post.update(
        {
          doc_read,
        },
        {
          where: { id },
        },
      );
      // await socket.emitToChat({
      //   post_id: exPost.id,
      //   event: 'READ_COMMENT',
      //   comment: {
      //     result: true,
      //     user_id: req.decoded.userId,
      //     post_id: exPost.id,
      //     userType,
      //     readAll: true,
      //   },
      // });
    } else if (req.decoded.userId == exPost.codoc_id) {
      readCount = exPost.comment_count - exPost.codoc_read;

      const codoc_read = exPost.comment_count;
      await Post.update(
        {
          codoc_read,
        },
        {
          where: { id },
        },
      );
      // await socket.emitToChat({
      //   post_id: exPost.id,
      //   event: 'READ_COMMENT',
      //   comment: {
      //     result: true,
      //     user_id: req.decoded.userId,
      //     post_id: exPost.id,
      //     userType,
      //     readAll: true,
      //   },
      // });

    }
    console.log(readCount);
    const post = await Post.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'img_url',
            'height',
            'weight',
            'gender',
            'blood',
            'birth_year',
          ],
          required: false,
        },
        {
          model: User,
          as: 'doc',
          attributes: ['name', 'img_url'],
          required: false,
        },
        {
          model: User,
          as: 'codoc',
          attributes: ['name', 'img_url', 'user_type', 'sub_type'],
          required: false,
        },
        {
          model: PostImg,
          attributes: ['img_url'],
          required: false,
        },
      ],
    });

    await User.update({
      push_count: Sequelize.literal(`push_count - ${readCount}`),
    },{
      where : { id : req.decoded.userId}
    })

    const exUser = await User.findOne({
      where: { id: req.decoded.userId }
    })

    if(exUser.push_count < 0){
      await User.update({
        push_count: 0,
      }, {
        where: { id: req.decoded.userId }
      })
    }

    res.json({
      result: true,
      list: post,
      readCount
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    let id = req.params.postid;

    const exPost = await Post.findOne({
      where: { id },
    });

    if (!exPost) {
      return res.status(404).json({
        result: false,
        text: '존재 하지 않는 포스트입니다.',
      });
    }

    const post = await Post.destroy({
      where: { id },
    });

    res.json({
      result: true,
      list: post,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const askAdmin = async (req, res, next) => {
  try {
    let { title, body, img_urls } = req.body;
    if (!title || !body) {
      return res.status(403).json({
        result: false,
      });
    }
    const regex = /(<([^>]+)>)/gi;
    console.log(title, body);
    body = body.replace(regex, '');

    const post = await Post.create({
      title,
      title_translation: title,
      title_english: title,
      body,
      user_id: req.decoded.userId,
      state: 20,
    });

    if (img_urls && img_urls.length) {
      for (const imgUrls of img_urls) {
        await PostImg.create({
          post_id: post.id,
          img_url: imgUrls,
        });
      }
    }

    res
      .status(201)
      .json({ result: true, id: post.id, text: '문의 성공입니다.' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getAskingAdminList = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, id, active = 1 } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    if (limit > 100) limit = 99;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const posts = await Post.findAndCountAll({
      where: {
        state: 20,
        ...(id ? { id } : {}),
        ...(active ? { active } : {}),
      },
      order: [['createdAt', 'DESC']], // column, direction
      distinct: true,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'name',
            'email',
            'img_url',
            'height',
            'weight',
            'gender',
            'birth_year',
          ],
          required: false,
        },
        {
          model: PostImg,
          attributes: ['img_url'],
          required: false,
        },
      ],
    });

    res.json({
      result: true,
      list: posts.rows,
      count: posts.count,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const acceptAskingAdmin = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(404).json({
        result: false,
        text: 'post id 가 없습니다.',
      });
    }

    const exPost = await Post.findOne({
      where: {
        id,
      },
    });
    if (!exPost) {
      return res.status(404).json({
        result: false,
        text: '존재 하지 않는 포스트입니다.',
      });
    }

    await Post.update(
      {
        active: 0,
      },
      {
        where: {
          id,
        },
      },
    );

    res.json({ result: true, text: '승인 완료' });
  } catch {
    console.log(error);
    next(error);
  }
};

module.exports = {
  // sendFileNames,
  // treatRequest,
  // getTreatRequestList,
  // getTreatAcceptList,
  // getCoTreatRequestList,
  // getCoTreatAcceptList,
  // getPostListByUser,
  // getPostListByDoc,
  // getPostListByCoDoc,
  // getPostList,
  // getPostDetail,
  // deletePost,
  // askAdmin,
  // getAskingAdminList,
  // acceptAskingAdmin,
};
