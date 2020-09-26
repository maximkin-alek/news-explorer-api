const articlesRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { urlValidator } = require('../validations/urlValidator');

Joi.objectId = require('joi-objectid')(Joi);

const {
  getArticles, createArticle, deleteArticle,
} = require('../controllers/articles');

articlesRouter.get('/', getArticles);

articlesRouter.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.date().required(),
    link: Joi.string().required().custom(urlValidator),
    source: Joi.string().required().custom(urlValidator),
    image: Joi.string().required().custom(urlValidator),

  }),
}), createArticle);

articlesRouter.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), deleteArticle);

module.exports = { articlesRouter };
