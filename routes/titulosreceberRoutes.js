const express = require('express');
const router = express.Router();
const titulosreceberController = require('../controllers/titulosreceberController');

/**
 * @swagger
 * tags:
 *   name: TitulosReceber
 *   description: Endpoints para gerenciamento de títulos a receber
 */

/**
 * @swagger
 * /api/titulosreceber:
 *   get:
 *     summary: Lista títulos a receber com filtros opcionais
 *     tags: [TitulosReceber]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: idfilial
 *         schema:
 *           type: integer
 *         description: ID da filial
 *       - in: query
 *         name: identidade
 *         schema:
 *           type: integer
 *         description: ID da entidade (cliente/fornecedor)
 *       - in: query
 *         name: idmoeda
 *         schema:
 *           type: integer
 *         description: ID da moeda
 *       - in: query
 *         name: datainicial
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (formato YYYY-MM-DD)
 *       - in: query
 *         name: datafinal
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de títulos a receber
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', titulosreceberController.getTituloReceber);

/**
 * @swagger
 * /api/titulosreceber/{idtitulo}:
 *   get:
 *     summary: Obtém um título a receber pelo ID
 *     tags: [TitulosReceber]
 *     parameters:
 *       - in: path
 *         name: idtitulo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título
 *     responses:
 *       200:
 *         description: Dados do título encontrado
 *       404:
 *         description: Título não encontrado
 */
router.get('/:idtitulo', titulosreceberController.getTituloReceberById);

router.get('/porvendabilhete/:idvenda', titulosreceberController.getTituloReceberByVendaBilhete);

/**
 * @swagger
 * /api/titulosreceber/{idtitulo}:
 *   delete:
 *     summary: Remove um título a receber existente
 *     tags: [TitulosReceber]
 *     parameters:
 *       - in: path
 *         name: idtitulo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título
 *     responses:
 *       200:
 *         description: Título removido com sucesso
 *       404:
 *         description: Título não encontrado
 */
router.delete('/:idtitulo', titulosreceberController.deleteTituloReceber);

/**
 * @swagger
 * /api/titulosreceber/porvendabilhete/{idvendabilhete}:
 *   delete:
 *     summary: Remove um título a receber existente
 *     tags: [TitulosReceber]
 *     parameters:
 *       - in: path
 *         name: idvendabilhete
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título
 *     responses:
 *       200:
 *         description: Título removido com sucesso
 *       404:
 *         description: Título não encontrado
 */
router.delete('/porvendabilhete/:idvenda', titulosreceberController.deleteTituloReceberByVendaBilhete);

/**
 * @swagger
 * /api/titulosreceber/{idvendahotel}:
 *   delete:
 *     summary: Remove um título a receber existente
 *     tags: [TitulosReceber]
 *     parameters:
 *       - in: path
 *         name: idvendahotel
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título
 *     responses:
 *       200:
 *         description: Título removido com sucesso
 *       404:
 *         description: Título não encontrado
 */
router.delete('/:idvendahotel', titulosreceberController.deleteTituloReceberByVendaHotel);

router.post('/', titulosreceberController.createTituloReceber);

router.put('/:idtitulo', titulosreceberController.updateTituloReceber);

module.exports = router;
