const jwt = require('jsonwebtoken');
const Usuario = require('../models/sql/Usuario');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id, email: usuario.email, role: usuario.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

const register = asyncHandler(async (req, res) => {
  const { nome, email, senha, adminSecret } = req.body;

  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    throw new AppError('Ja existe um usuario cadastrado com este e-mail.', 409);
  }

  const role = adminSecret && env.adminBootstrapSecret && adminSecret === env.adminBootstrapSecret ? 'admin' : 'user';

  const usuario = await Usuario.create({ nome, email, senha, role });
  const token = gerarToken(usuario);

  res.status(201).json({
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    token,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await Usuario.scope('withSenha').findOne({ where: { email } });
  if (!usuario || !(await usuario.checkSenha(senha))) {
    throw new AppError('Credenciais invalidas.', 401);
  }

  const token = gerarToken(usuario);

  res.status(200).json({
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    token,
  });
});

const me = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByPk(req.user.id);
  if (!usuario) {
    throw new AppError('Usuario nao encontrado.', 404);
  }
  res.status(200).json(usuario);
});

module.exports = { register, login, me };
