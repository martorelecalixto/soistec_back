const express = require('express');
const router = express.Router();
const increcibosreceberController = require('../controllers/increcibosreceberController');

/**
 * @swagger
 * tags:
 *   name: RecibosReceber
 *   description: Endpoints para gerenciamento de vendas
 */

/**
 * @swagger
 * /api/increcibosreceber:
 *   get:
 *     summary: Gera um novo ID para venda por empresa
 *     tags: [IncReciboRec]
 *     parameters:
 *       - in: query
 *         name: idempresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa para gerar o ID
 *     responses:
 *       200:
 *         description: Novo ID gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 novoId:
 *                   type: integer
 *       400:
 *         description: Parâmetro "empresa" ausente
 *       500:
 *         description: Erro interno ao gerar ID
 */
router.get('/:idempresa', increcibosreceberController.incReciboRec);

module.exports = router;
