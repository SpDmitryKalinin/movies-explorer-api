const router = require('express').Router();
const { getUser, updateUser, createUser } = require('../controllers/users');
const { validatePatchUser, validateCreateUser } = require('../utils/validate');

router.get('/users/me', getUser);
router.patch('/users/me', validatePatchUser, updateUser);

router.post('/users', validateCreateUser, createUser);
module.exports = router;
