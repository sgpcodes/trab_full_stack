const Usuario = require('../models/sql/Usuario');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const listar = asyncHandler(async (req, res) => {
  const usuarios = await Usuario.findAll();
  res.status(200).json(usuarios);
});

const buscarPorId = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new AppError('Usuario nao encontrado.', 404);
  res.status(200).json(usuario);
});

const atualizar = asyncHandler(async (req, res) => {
  const usuario = await Usuario.scope('withSenha').findByPk(req.params.id);
  if (!usuario) throw new AppError('Usuario nao encontrado.', 404);

  const { nome, email, senha } = req.body;

  if (email && email !== usuario.email) {
    const existente = await Usuario.findOne({ where: { email } });
    if (existente) throw new AppError('Ja existe um usuario cadastrado com este e-mail.', 409);
  }

  if (nome !== undefined) usuario.nome = nome;
  if (email !== undefined) usuario.email = email;
  if (senha !== undefined) usuario.senha = senha;

  await usuario.save();
  const { senha: _senha, ...semSenha } = usuario.toJSON();
  res.status(200).json(semSenha);
});

const remover = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) throw new AppError('Usuario nao encontrado.', 404);
  await usuario.destroy();
  res.status(204).send();
});

module.exports = { listar, buscarPorId, atualizar, remover };
