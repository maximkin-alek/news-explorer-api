const { celebrate, Joi } = require('celebrate');
const { urlValidator } = require('./urlValidator');

const articleCreateValidator = celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.date().required(),
    link: Joi.string().required().custom(urlValidator),
    source: Joi.string().required(),
    image: Joi.string().required().custom(urlValidator),

  }),
});

module.exports = { articleCreateValidator };
