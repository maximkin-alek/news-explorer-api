const Article = require('../models/article');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/forbiddenError');
const NotFoundError = require('../errors/notFoundError');

module.exports.getArticles = (req, res, next) => {
  Article.find({ owner: req.user._id })
    .then((articles) => {
      res.send({ data: articles });
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
    .then((article) => res.status(201).send({
      link: article.link,
      keyword: article.keyword,
      title: article.title,
      text: article.text,
      date: article.date,
      source: article.source,
      image: article.image,
    }))
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
    .then((article) => {
      if (article.owner.id === req.user._id) {
        article.remove()
          .then(() => {
            res.send({ data: article });
          })
          .catch(next);
      } else { throw new ForbiddenError('Недостаточно прав для этого действия'); }
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Такой статьи не существует');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      } else { next(err); }
    })
    .catch(next);
};
