const express = require('express');
const router = express.Router();
const acomodacoesController = require('../controllers/acomodacoesController');

/**
 * @swagger
 * tags:
 *   name: Acomodacoes
 *   description: Endpoints para gerenciamento de acomodações
 */

/**
 * @swagger
 * /api/acomodacoes:
 *   get:
 *     summary: Lista acomodações com filtros opcionais
 *     tags: [Acomodacoes]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da acomodação
 *     responses:
 *       200:
 *         description: Lista de acomodações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   empresa:
 *                     type: string
 */
router.get('/', acomodacoesController.getAcomodacoes);

/**
 * @swagger
 * /api/acomodacoes/{id}:
 *   get:
 *     summary: Retorna uma acomodação pelo ID
 *     tags: [Acomodacoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da acomodação
 *     responses:
 *       200:
 *         description: Acomodação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 empresa:
 *                   type: string
 *       404:
 *         description: Acomodação não encontrada
 */
router.get('/:id', acomodacoesController.getAcomodacaoById);

/**
 * @swagger
 * /api/acomodacoes:
 *   post:
 *     summary: Cria uma nova acomodação
 *     tags: [Acomodacoes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - empresa
 *             properties:
 *               nome:
 *                 type: string
 *               empresa:
 *                 type: string
 *     responses:
 *       201:
 *         description: Acomodação criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', acomodacoesController.createAcomodacao);

/**
 * @swagger
 * /api/acomodacoes/{id}:
 *   put:
 *     summary: Atualiza uma acomodação existente
 *     tags: [Acomodacoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da acomodação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *     responses:
 *       200:
 *         description: Acomodação atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Acomodação não encontrada
 */
router.put('/:id', acomodacoesController.updateAcomodacao);

/**
 * @swagger
 * /api/acomodacoes/{id}:
 *   delete:
 *     summary: Remove uma acomodação existente
 *     tags: [Acomodacoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da acomodação
 *     responses:
 *       200:
 *         description: Acomodação removida com sucesso
 *       404:
 *         description: Acomodação não encontrada
 */
router.delete('/:id', acomodacoesController.deleteAcomodacao);

module.exports = router;
