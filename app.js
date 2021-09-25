require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');
const indexRouter = require('./routes/index');

const { NODE_ENV, BD_ADRESS, RATE_LIMIT } = process.env;
const errorsHandler = require('./middlewares/errors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();
const { PORT = 3000 } = process.env;
const adress = NODE_ENV === 'production' ? BD_ADRESS : 'mongodb://localhost:27017/bitfilmsdb';
const rateLimitCount = NODE_ENV === 'production' ? RATE_LIMIT : 10;
const limiter = rateLimit(rateLimitCount);

mongoose.connect(adress, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.options('*', cors());

app.use(cors({
  origin: ['http://elmovies.nomoredomains.monster', 'https://elmovies.nomoredomains.monster'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(requestLogger);
app.use(express.json());
app.use(limiter);
app.use(helmet());
app.use('/', indexRouter);
app.use(errorLogger);
app.use(errors());
app.use(errorsHandler);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('start server');
});
