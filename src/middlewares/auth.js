const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Token de autenticacao ausente ou invalido.', 401));
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    return next();
  } catch (err) {
    return next(new AppError('Token de autenticacao expirado ou invalido.', 401));
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Acesso negado: permissao insuficiente.', 403));
    }
    return next();
  };
}

function authorizeSelfOrAdmin(paramName = 'id') {
  return (req, res, next) => {
    const targetId = req.params[paramName];
    if (req.user.role === 'admin' || String(req.user.id) === String(targetId)) {
      return next();
    }
    return next(new AppError('Acesso negado: voce so pode acessar seus proprios dados.', 403));
  };
}

module.exports = { authenticate, authorize, authorizeSelfOrAdmin };
