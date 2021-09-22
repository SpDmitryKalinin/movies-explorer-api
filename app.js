require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const {errors} = require('celebrate');
const indexRouter = require('./routes/index');
const NotFoundError = require('./errors/NotFoundError');
const errorsHandler = require('./middlewares/errors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const app = express();
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(requestLogger);
app.use(express.json());

app.use('/', indexRouter);

app.use(errorLogger);
app.use(errors());
app.use(errorsHandler);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Ресурс не найден.'));
});

app.listen(PORT, () => {
  console.log('start server');
});
