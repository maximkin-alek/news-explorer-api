const articlesRouter = require('express').Router();
const { articleCreateValidator } = require('../validations/articleCreateValidator');
const { articleDeleteValidator } = require('../validations/articleDeleteValidator');

const {
  getArticles, createArticle, deleteArticle,
} = require('../controllers/articles');

articlesRouter.get('/', getArticles);

articlesRouter.post('/', articleCreateValidator, createArticle);

articlesRouter.delete('/:id', articleDeleteValidator, deleteArticle);

module.exports = articlesRouter;
