const express = require('express');
const router = express.Router();
const centrocustoController = require('../controllers/centrocustoController');

/**
 * @swagger
 * tags:
 *   name: CentroCusto
 *   description: Endpoints para gerenciamento de centro custo
 */

/**
 * @swagger
 * /api/centrocusto:
 *   get:
 *     summary: Lista centro custo com filtros opcionais
 *     tags: [CentroCusto]
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
 *         description: Nome do centro custo
 *     responses:
 *       200:
 *         description: Lista de centro custo
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
router.get('/', centrocustoController.getCentroCusto);

/**
 * @swagger
 * /api/centrocusto/{id}:
 *   get:
 *     summary: Retorna uma centro custo pelo ID
 *     tags: [CentroCusto]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da centro custo
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
router.get('/:id', centrocustoController.getCentroCustoById);

/**
 * @swagger
 * /api/centrocusto:
 *   post:
 *     summary: Cria um novo centro custo
 *     tags: [CentroCusto]
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
 *               idpai:
 *                 type: integer
 *               tipo:
 *                 type: string
 *               idpaigeral:
 *                 type: integer
 *               chave:
 *                 type: string
 *     responses:
 *       201:
 *         description: Centro Custo criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', centrocustoController.createCentroCusto);

/**
 * @swagger
 * /api/centrocusto/{id}:
 *   put:
 *     summary: Atualiza uma centro custo existente
 *     tags: [CentroCusto]
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
 *         description: Centro atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Centro custo não encontrado
 */
router.put('/:id', centrocustoController.updateCentroCusto);

/**
 * @swagger
 * /api/centrocusto/{id}:
 *   delete:
 *     summary: Remove um centro custo existente
 *     tags: [CentroCusto]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da centro custo
 *     responses:
 *       200:
 *         description: Centro custo removido com sucesso
 *       404:
 *         description: Centro Custo não encontrado
 */
router.delete('/:id', centrocustoController.deleteCentroCusto);

module.exports = router;
