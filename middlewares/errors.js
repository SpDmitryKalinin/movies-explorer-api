const errorsHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const response = err.message || '500: Ошибка на стороне сервера';

  res.status(status).send({ response });

  next();
};

module.exports = errorsHandler;
