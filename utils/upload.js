const multer = require('multer');
const fs = require('fs');
const path = require('path');


try {
  fs.readdirSync('public/uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('public/uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './public/uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        return cb(new Error('Only JPG and JPEG are allowed'));
      }
      cb(null, path.basename(file.originalname, ext) + '_' + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const upload2 = multer();

module.exports = { upload, upload2 };
