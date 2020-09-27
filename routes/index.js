const router = require('express').Router();

const articlesRouter = require('./articles');
const userRouter = require('./users');
const NotFoundError = require('../errors/notFoundError');

router.use('/articles', articlesRouter);
router.use('/users', userRouter);
router.use(() => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

module.exports = router;
