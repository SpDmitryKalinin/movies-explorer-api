const bcrypt = require('bcryptjs');

const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const NotFoundError = require('../errors/NotFoundError');
const Unauthorized = require('../errors/Unauthorized');
const ServerError = require('../errors/ServerError');
const Conflict = require('../errors/Conflict');

// Информация о себе
const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => { res.status(200).send(user); })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new Unauthorized('401: Неправильный пароль.'));
      }
      next(new ServerError('500: ошибка на сервере'));
    });
};

// Функция создания пользователя
const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  User.findOne({ email }).then(() => {
    bcrypt.hash(password, 10)
      .then((hash) => {
        User.create({
          name, email, password: hash,
        })
          .then((user) => {
            res.status(200).send({
              _id: user._id,
              name: user.name,
              email: user.email,
            });
          })
          .catch((err) => {
            if (err.name === 'ValidationError') {
              next(new BadRequest('400: Ошибка в запросе'));
            }
            next(new Conflict('409:Пользователь с таким email существует'));
          });
      })
      .catch(() => {
        next(new ServerError('500: ошибка на сервере'));
      });
  })
    .catch(() => {
      next(new ServerError('500: ошибка на сервере'));
    });
};

// Обновление данных пользователя
const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError('404: Пользователя с данным ID нет в БД.'));
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequest('400: Ошибка в запросе'));
      }
      next(new ServerError('500: ошибка на сервере'));
    });
};

// Функция логин
const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        next(new Unauthorized('401: Неправильный пароль.'));
      }
      return bcrypt.compare(password, user.password)
        .then((mathed) => {
          if (!mathed) {
            console.log('!!!');
            next(new Unauthorized('401: Неправильный пароль.'));
          }
          return user;
        });
    })
    .then((user) => {
      const token = jwt.sign({ _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' });
      return res
        .status(201)
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        })
        .send({ message: 'Авторизация успешно пройдена', token });
    })

    .catch(() => {
      next(new ServerError('500: ошибка на сервере'));
    });
};

module.exports = {
  getUser, updateUser, createUser, login,
};
