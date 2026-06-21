const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const mongoCrudFactory = require('../controllers/mongoCrudFactory');
const Carro = require('../models/mongo/Carro');

const router = express.Router();
const { listar, buscarPorId, criar, atualizar, remover } = mongoCrudFactory(Carro, 'Carro');

const regrasCriacao = [
  body('marca').trim().notEmpty().withMessage('Marca e obrigatoria.'),
  body('modelo').trim().notEmpty().withMessage('Modelo e obrigatorio.'),
  body('ano').isInt({ min: 1900, max: 2100 }).withMessage('Ano invalido.'),
  body('cor').trim().notEmpty().withMessage('Cor e obrigatoria.'),
  body('preco').isFloat({ min: 0 }).withMessage('Preco invalido.'),
  body('placa').trim().notEmpty().withMessage('Placa e obrigatoria.'),
];

const regrasAtualizacao = [
  body('marca').optional().trim().notEmpty().withMessage('Marca nao pode ser vazia.'),
  body('modelo').optional().trim().notEmpty().withMessage('Modelo nao pode ser vazio.'),
  body('ano').optional().isInt({ min: 1900, max: 2100 }).withMessage('Ano invalido.'),
  body('cor').optional().trim().notEmpty().withMessage('Cor nao pode ser vazia.'),
  body('preco').optional().isFloat({ min: 0 }).withMessage('Preco invalido.'),
  body('placa').optional().trim().notEmpty().withMessage('Placa nao pode ser vazia.'),
];

router.use(authenticate);

/**
 * @openapi
 * /carros:
 *   get:
 *     tags: [Carros]
 *     summary: Lista todos os carros
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de carros }
 *   post:
 *     tags: [Carros]
 *     summary: Cria um novo carro
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [marca, modelo, ano, cor, preco, placa]
 *             properties:
 *               marca: { type: string, example: "Fiat" }
 *               modelo: { type: string, example: "Argo" }
 *               ano: { type: integer, example: 2022 }
 *               cor: { type: string, example: "Preto" }
 *               preco: { type: number, example: 75000 }
 *               placa: { type: string, example: "ABC1D23" }
 *     responses:
 *       201: { description: Carro criado }
 */
router.get('/', listar);
router.post('/', regrasCriacao, validate, criar);

/**
 * @openapi
 * /carros/{id}:
 *   get:
 *     tags: [Carros]
 *     summary: Busca um carro por id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Carro encontrado }
 *       404: { description: Carro nao encontrado }
 *   put:
 *     tags: [Carros]
 *     summary: Atualiza um carro
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Carro atualizado }
 *       404: { description: Carro nao encontrado }
 *   delete:
 *     tags: [Carros]
 *     summary: Remove um carro
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Carro removido }
 *       404: { description: Carro nao encontrado }
 */
router.get('/:id', param('id').isMongoId().withMessage('Id invalido.'), validate, buscarPorId);
router.put('/:id', [param('id').isMongoId().withMessage('Id invalido.'), ...regrasAtualizacao], validate, atualizar);
router.delete('/:id', param('id').isMongoId().withMessage('Id invalido.'), validate, remover);

module.exports = router;
