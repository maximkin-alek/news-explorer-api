const { celebrate, Joi } = require('celebrate');

Joi.objectId = require('joi-objectid')(Joi);

const articleDeleteValidator = celebrate({
  params: Joi.object().keys({
    id: Joi.objectId(),
  }),
});

module.exports = { articleDeleteValidator };
