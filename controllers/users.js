const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PasswordValidator = require('password-validator');
const User = require('../models/user');
const UnauthorizedError = require('../errors/unauthorizedError');
const BadRequestError = require('../errors/badRequestError');
const ConflictError = require('../errors/conflictError');
const NotFoundError = require('../errors/notFoundError');

const { NODE_ENV, JWT_SECRET } = process.env;

const passValid = new PasswordValidator();
passValid
  .is().min(8)
  .is().max(100)
  .has()
  .not()
  .spaces();

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => { })
    .then((user) => res.send({
      name: user.name,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Такого пользователя не существует');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      } else { next(err); }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  if (!passValid.validate(password)) {
    throw new BadRequestError('Пароль должен содержать не менее 8 и не более 100 символов');
  } else {
    bcrypt.hash(password, 10)
      .then((hash) => {
        User.create({
          name, email, password: hash,
        })
          .then((user) => res.status(201).send({
            _id: user._id,
            name: user.name,
            email: user.email,
          }))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              throw new BadRequestError('Данные не валидны');
            } else if (err.name === 'MongoError' && err.code === 11000) {
              throw new ConflictError('Пользователь с таким email уже существует');
            } else { next(err); }
          })
          .catch(next);
      })
      .catch((err) => next(err));
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUser(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : '654gfqwg46q5q69qw4frf654', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: false,
      })
        .send({ message: 'Авторизация прошла успешно' })
        .end();
    })
    .catch(() => {
      throw new UnauthorizedError('Неправильный логин или пароль');
    })
    .catch(next);
};

module.exports.logout = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => { })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : '654gfqwg46q5q69qw4frf654', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 0,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      res.send({
        massage: 'Вы вышли из аккаунта',
      });
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Такого пользователя не существует');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      } else { next(err); }
    })
    .catch(next);
};
