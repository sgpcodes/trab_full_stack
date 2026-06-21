const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { authenticate, authorize, authorizeSelfOrAdmin } = require('../middlewares/auth');
const { listar, buscarPorId, atualizar, remover } = require('../controllers/usuarioController');

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /usuarios:
 *   get:
 *     tags: [Usuarios]
 *     summary: Lista todos os usuarios (somente admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de usuarios }
 *       403: { description: Acesso negado }
 */
router.get('/', authorize('admin'), listar);

/**
 * @openapi
 * /usuarios/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Busca um usuario por id (admin ou o proprio usuario)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Usuario encontrado }
 *       403: { description: Acesso negado }
 *       404: { description: Usuario nao encontrado }
 */
router.get('/:id', param('id').isInt().withMessage('Id invalido.'), validate, authorizeSelfOrAdmin('id'), buscarPorId);

/**
 * @openapi
 * /usuarios/{id}:
 *   put:
 *     tags: [Usuarios]
 *     summary: Atualiza um usuario (admin ou o proprio usuario)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome: { type: string }
 *               email: { type: string }
 *               senha: { type: string }
 *     responses:
 *       200: { description: Usuario atualizado }
 *       403: { description: Acesso negado }
 *       404: { description: Usuario nao encontrado }
 */
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('Id invalido.'),
    body('nome').optional().trim().notEmpty().withMessage('Nome nao pode ser vazio.'),
    body('email').optional().isEmail().withMessage('E-mail invalido.'),
    body('senha').optional().isLength({ min: 6 }).withMessage('Senha deve ter no minimo 6 caracteres.'),
  ],
  validate,
  authorizeSelfOrAdmin('id'),
  atualizar
);

/**
 * @openapi
 * /usuarios/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Remove um usuario (somente admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Usuario removido }
 *       403: { description: Acesso negado }
 *       404: { description: Usuario nao encontrado }
 */
router.delete('/:id', param('id').isInt().withMessage('Id invalido.'), validate, authorize('admin'), remover);

module.exports = router;
