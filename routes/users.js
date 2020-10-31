const userRouter = require('express').Router();
const { getUser, logout } = require('../controllers/users');

userRouter.get('/me', getUser);
userRouter.get('/logout', logout);

module.exports = userRouter;
