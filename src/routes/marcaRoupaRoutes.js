const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const mongoCrudFactory = require('../controllers/mongoCrudFactory');
const MarcaRoupa = require('../models/mongo/MarcaRoupa');

const router = express.Router();
const { listar, buscarPorId, criar, atualizar, remover } = mongoCrudFactory(MarcaRoupa, 'Marca de roupa');

const regrasCriacao = [
  body('nome').trim().notEmpty().withMessage('Nome e obrigatorio.'),
  body('paisOrigem').trim().notEmpty().withMessage('Pais de origem e obrigatorio.'),
  body('segmento').trim().notEmpty().withMessage('Segmento e obrigatorio.'),
  body('anoFundacao').isInt({ min: 1800, max: 2100 }).withMessage('Ano de fundacao invalido.'),
  body('siteOficial').optional().trim(),
];

const regrasAtualizacao = [
  body('nome').optional().trim().notEmpty().withMessage('Nome nao pode ser vazio.'),
  body('paisOrigem').optional().trim().notEmpty().withMessage('Pais de origem nao pode ser vazio.'),
  body('segmento').optional().trim().notEmpty().withMessage('Segmento nao pode ser vazio.'),
  body('anoFundacao').optional().isInt({ min: 1800, max: 2100 }).withMessage('Ano de fundacao invalido.'),
  body('siteOficial').optional().trim(),
];

router.use(authenticate);

/**
 * @openapi
 * /marcas-roupa:
 *   get:
 *     tags: [MarcasDeRoupa]
 *     summary: Lista todas as marcas de roupa
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de marcas de roupa }
 *   post:
 *     tags: [MarcasDeRoupa]
 *     summary: Cria uma nova marca de roupa
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, paisOrigem, segmento, anoFundacao]
 *             properties:
 *               nome: { type: string, example: "Osklen" }
 *               paisOrigem: { type: string, example: "Brasil" }
 *               segmento: { type: string, example: "Casual" }
 *               anoFundacao: { type: integer, example: 1989 }
 *               siteOficial: { type: string, example: "https://osklen.com" }
 *     responses:
 *       201: { description: Marca de roupa criada }
 */
router.get('/', listar);
router.post('/', regrasCriacao, validate, criar);

/**
 * @openapi
 * /marcas-roupa/{id}:
 *   get:
 *     tags: [MarcasDeRoupa]
 *     summary: Busca uma marca de roupa por id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Marca de roupa encontrada }
 *       404: { description: Marca de roupa nao encontrada }
 *   put:
 *     tags: [MarcasDeRoupa]
 *     summary: Atualiza uma marca de roupa
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Marca de roupa atualizada }
 *       404: { description: Marca de roupa nao encontrada }
 *   delete:
 *     tags: [MarcasDeRoupa]
 *     summary: Remove uma marca de roupa
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Marca de roupa removida }
 *       404: { description: Marca de roupa nao encontrada }
 */
router.get('/:id', param('id').isMongoId().withMessage('Id invalido.'), validate, buscarPorId);
router.put('/:id', [param('id').isMongoId().withMessage('Id invalido.'), ...regrasAtualizacao], validate, atualizar);
router.delete('/:id', param('id').isMongoId().withMessage('Id invalido.'), validate, remover);

module.exports = router;
