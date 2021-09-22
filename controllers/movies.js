const Movie = require('../models/movie');
const BadRequest = require('../errors/BadRequest');
const NotFoundError = require('../errors/NotFoundError');
const ServerError = require('../errors/ServerError');
const Forbidden = require('../errors/Forbidden');

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner }).then((movies) => {
    res.status(200).send(movies);
  })
    .catch(() => {
      next(new ServerError('500: ошибка на сервере'));
    });
};

// Функция создания фильма
const createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailer, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => {
      res.status(200).send(movie);
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'ValidationError') {
        next(new BadRequest('400: Некорректно внесены данные.'));
      }
      next(new ServerError('500: ошибка на сервере'));
    });
};


const deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        next(new NotFoundError('404: данные фильма не найдены'));
      }
      else if (movie.owner._id.toString() === owner) {
        movie.remove().then(() => {
          res.status(200).send(movie);
        })
          .catch(() => {
            next(new ServerError('500: ошибка на сервере'));
          });
      } else {
        next(new Forbidden('403: Нельзя удалять чужие фильмы'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('400: Некорректно внесены данные.'));
      } else {
        next(new ServerError('500: ошибка на сервере'));
      }
    });
};

module.exports = {
  getMovies, createMovie, deleteMovie,
};
