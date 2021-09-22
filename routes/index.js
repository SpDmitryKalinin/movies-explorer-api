const router = require('express').Router();
const { celebrate, Joi} = require('celebrate');
const auth = require('./../middlewares/auth');
const userRouter = require('./users');
const movieRouter = require('./movies');
const { createUser, login } = require('./../controllers/users');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}),
login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}),
createUser);

router.use(auth);
router.use('/', movieRouter);
router.use('/', userRouter);

module.exports = router