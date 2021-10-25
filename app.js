const express =  require('express');
const morgan =  require('morgan');
const dotenv =  require('dotenv');
const path =  require('path');
const helmet = require("helmet");
var cookieParser = require('cookie-parser')

dotenv.config();
const router = require('./routes');
const { sequelize } = require('./models');

const app = express();

app.set('port', process.env.PORT || 3001);

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database connected!');
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser())
app.use(helmet());

app.use('/api',router.indexRouter);
app.use('/api/auth',router.authRouter);
app.use('/api/users',router.usersRouter);

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} not found`);
    error.status = 404;
    next(error);
  });

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(`${err.message} ${process.env.NODE_ENV !== 'production' ? err : {}}`);
});
  
app.listen(app.get('port'), () => {
    console.log(app.get('port'), ' running');
});



/***************************************************/
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});