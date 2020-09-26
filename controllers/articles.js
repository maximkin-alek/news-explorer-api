const Article = require('../models/article');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/forbiddenError');
const NotFoundError = require('../errors/notFoundError');

module.exports.getArticles = (req, res, next) => {
  Article.find({})
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch(next);
};

module.exports.createArticle = (req, res, next) => {
  const {
    link, keyword, title, text, date, source, image,
  } = req.body;
  const owner = req.user._id;
  Article.create({
    link, owner, keyword, title, text, date, source, image,
  })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`Данные не валидны: ${err.message}`));
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id)
    .orFail(() => { })
    .populate('owner')
    .then((card) => {
      if (card.owner.id === req.user._id) {
        card.remove()
          .then(() => {
            res.send({ data: card });
          })
          .catch(next);
      } else { throw new ForbiddenError('Недостаточно прав для этого действия'); }
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Такой карточки не существует');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      } else { next(err); }
    })
    .catch(next);
};
