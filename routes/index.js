const router = require('express').Router();
const auth = require('../middlewares/auth');
const userRouter = require('./users');
const movieRouter = require('./movies');
const { createUser, login } = require('../controllers/users');
const { validateSignin } = require('../utils/validate');
const NotFoundError = require('../errors/NotFoundError');

router.post('/signin', validateSignin, login);
router.post('/signup', createUser);

router.use(auth);
router.use('/', movieRouter);
router.use('/', userRouter);
router.use('*', (req, res, next) => {
  next(new NotFoundError('404: Страница не найдена.'));
});

module.exports = router;
