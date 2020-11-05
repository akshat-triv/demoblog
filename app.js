const morgan = require('morgan');
const path = require('path');
const express = require('express');
const xss = require('xss-clean');
const sanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const AppError = require('./utils/appError');

const articleRouter = require('./routes/articleRouter');
const commentRouter = require('./routes/commentRouter');
const viewRouter = require('./routes/viewRouter');
const globalErrorController = require('./controllers/errorController');

const app = express();

//app.use(helmet());

//Setting up view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(compression());

//For logging hte requests to the console
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Body parser
app.use(express.json());
app.use(sanitize());
app.use(xss());
//Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.options(
  '*',
  cors({
    origin: 'akshattrivedi.herokuapp.com/',
    optionsSuccessStatus: 200,
  })
);

app.use('/', viewRouter);
app.use('/api/v1/article', articleRouter);
app.use('/api/v1/comment', commentRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't process ${req.originalUrl}`, 404));
});

app.use(globalErrorController);

module.exports = app;
