const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { register, login, me } = require('../controllers/authController');

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registra um novo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome: { type: string, example: "Maria Silva" }
 *               email: { type: string, example: "maria@email.com" }
 *               senha: { type: string, example: "SenhaForte123" }
 *               adminSecret: { type: string, example: "" }
 *     responses:
 *       201: { description: Usuario criado com sucesso }
 *       400: { description: Erro de validacao }
 *       409: { description: E-mail ja cadastrado }
 */
router.post(
  '/register',
  [
    body('nome').trim().notEmpty().withMessage('Nome e obrigatorio.'),
    body('email').isEmail().withMessage('E-mail invalido.'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no minimo 6 caracteres.'),
  ],
  validate,
  register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autentica um usuario e retorna um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email: { type: string, example: "maria@email.com" }
 *               senha: { type: string, example: "SenhaForte123" }
 *     responses:
 *       200: { description: Login realizado com sucesso }
 *       401: { description: Credenciais invalidas }
 */
router.post(
  '/login',
  [body('email').isEmail().withMessage('E-mail invalido.'), body('senha').notEmpty().withMessage('Senha obrigatoria.')],
  validate,
  login
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Retorna os dados do usuario autenticado
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dados do usuario autenticado }
 *       401: { description: Nao autenticado }
 */
router.get('/me', authenticate, me);

module.exports = router;
