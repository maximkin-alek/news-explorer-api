require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { MONGO_ADRESS, NODE_ENV } = process.env;
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const limiter = require('./validations/rateLimiter');
const { signinValidator } = require('./validations/signinValidation');
const { signupValidator } = require('./validations/signupValidation');
const routes = require('./routes/index');
const errorsHandler = require('./middlewares/errorsHandler');

mongoose.connect(NODE_ENV === 'production' ? MONGO_ADRESS : 'mongodb://localhost:27017/news-explorer', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
const { PORT = 3000 } = process.env;
const app = express();

const corsOptions = {
  origin: [
    'https://api.alex-newsexp.tk',
    'http://localhost:8080',
    'http://localhost',
    'https://alex-newsexp.tk',
    'https://maximkin-alek.github.io/news-explorer-frontend/',
    'https://maximkin-alek.github.io',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: [
    'Content-Type',
    'origin',
    'x-access-token',
    'authorization',
    'credentials',
  ],
  credentials: true,
};

app.use('*', cors(corsOptions));

app.use(helmet());
app.use(limiter);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(requestLogger);

app.post('/signin', signinValidator, login);

app.post('/signup', signupValidator, createUser);

app.use(auth);
app.use(routes);

app.use(errorLogger);

app.use(errors());
app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
