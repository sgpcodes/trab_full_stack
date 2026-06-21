const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const mongoCrudFactory = require('../controllers/mongoCrudFactory');
const Moto = require('../models/mongo/Moto');

const router = express.Router();
const { listar, buscarPorId, criar, atualizar, remover } = mongoCrudFactory(Moto, 'Moto');

const regrasCriacao = [
  body('marca').trim().notEmpty().withMessage('Marca e obrigatoria.'),
  body('modelo').trim().notEmpty().withMessage('Modelo e obrigatorio.'),
  body('ano').isInt({ min: 1900, max: 2100 }).withMessage('Ano invalido.'),
  body('cilindrada').isFloat({ min: 0 }).withMessage('Cilindrada invalida.'),
  body('cor').trim().notEmpty().withMessage('Cor e obrigatoria.'),
  body('preco').isFloat({ min: 0 }).withMessage('Preco invalido.'),
];

const regrasAtualizacao = [
  body('marca').optional().trim().notEmpty().withMessage('Marca nao pode ser vazia.'),
  body('modelo').optional().trim().notEmpty().withMessage('Modelo nao pode ser vazio.'),
  body('ano').optional().isInt({ min: 1900, max: 2100 }).withMessage('Ano invalido.'),
  body('cilindrada').optional().isFloat({ min: 0 }).withMessage('Cilindrada invalida.'),
  body('cor').optional().trim().notEmpty().withMessage('Cor nao pode ser vazia.'),
  body('preco').optional().isFloat({ min: 0 }).withMessage('Preco invalido.'),
];

router.use(authenticate);

/**
 * @openapi
 * /motos:
 *   get:
 *     tags: [Motos]
 *     summary: Lista todas as motos
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de motos }
 *   post:
 *     tags: [Motos]
 *     summary: Cria uma nova moto
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [marca, modelo, ano, cilindrada, cor, preco]
 *             properties:
 *               marca: { type: string, example: "Honda" }
 *               modelo: { type: string, example: "CB 500" }
 *               ano: { type: integer, example: 2023 }
 *               cilindrada: { type: number, example: 500 }
 *               cor: { type: string, example: "Vermelha" }
 *               preco: { type: number, example: 45000 }
 *     responses:
 *       201: { description: Moto criada }
 */
router.get('/', listar);
router.post('/', regrasCriacao, validate, criar);

/**
 * @openapi
 * /motos/{id}:
 *   get:
 *     tags: [Motos]
 *     summary: Busca uma moto por id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Moto encontrada }
 *       404: { description: Moto nao encontrada }
 *   put:
 *     tags: [Motos]
 *     summary: Atualiza uma moto
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Moto atualizada }
 *       404: { description: Moto nao encontrada }
 *   delete:
 *     tags: [Motos]
 *     summary: Remove uma moto
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Moto removida }
 *       404: { description: Moto nao encontrada }
 */
router.get('/:id', param('id').isMongoId().withMessage('Id invalido.'), validate, buscarPorId);
router.put('/:id', [param('id').isMongoId().withMessage('Id invalido.'), ...regrasAtualizacao], validate, atualizar);
router.delete('/:id', param('id').isMongoId().withMessage('Id invalido.'), validate, remover);

module.exports = router;
