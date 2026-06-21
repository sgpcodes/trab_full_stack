const env = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ message: `Rota nao encontrada: ${req.method} ${req.originalUrl}` });
}

function normalizeKnownErrors(err) {
  if (err.name === 'CastError') {
    return { statusCode: 400, message: 'Identificador invalido.' };
  }
  if (err.name === 'ValidationError' && err.errors) {
    const mensagens = Object.values(err.errors).map((e) => e.message);
    return { statusCode: 400, message: mensagens.join(' ') };
  }
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const mensagens = err.errors.map((e) => e.message);
    return { statusCode: 400, message: mensagens.join(' ') };
  }
  return null;
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const known = normalizeKnownErrors(err);
  const statusCode = known?.statusCode || err.statusCode || 500;
  const isOperational = Boolean(known) || err.isOperational || false;

  if (!isOperational) {
    console.error('[erro nao tratado]', err);
  }

  const body = {
    message: isOperational ? known?.message || err.message : 'Erro interno do servidor.',
  };

  if (env.nodeEnv === 'development' && !isOperational) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
