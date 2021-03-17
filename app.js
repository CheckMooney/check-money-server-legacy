const express =  require('express');
const morgan =  require('morgan');
const dotenv =  require('dotenv');
const path =  require('path');
var cookieParser = require('cookie-parser')

dotenv.config();
const indexRouter = require('./routes');
// const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
// const { sequelize } = require('./models');

const app = express();

app.set('port', process.env.PORT || 3000);

// sequelize.sync({ force: false })
//   .then(() => {
//     console.log('데이터베이스 연결 성공');
//   })
//   .catch((err) => {
//     console.error(err);
//   });

app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser())

app.use('/',indexRouter);
app.use('/auth',authRouter);
// app.use('/user',userRouter);
// app.use('/doc',userRouter);
// app.use('/codoc',userRouter);

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(`${err.message} ${process.env.NODE_ENV !== 'production' ? err : {}}`);
});
  
app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});
  
