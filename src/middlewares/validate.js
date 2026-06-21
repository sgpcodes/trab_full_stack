const { validationResult } = require('express-validator');

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Erro de validacao.',
      errors: errors.array().map((e) => ({ campo: e.path, mensagem: e.msg })),
    });
  }
  return next();
};
