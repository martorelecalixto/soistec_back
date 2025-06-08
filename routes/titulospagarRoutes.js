const express = require('express');
const router = express.Router();
const titulospagarController = require('../controllers/titulospagarController');

/**
 * @swagger
 * tags:
 *   name: TitulosPagar
 *   description: Endpoints para gerenciamento de títulos a pagar
 */

/**
 * @swagger
 * /api/titulospagar:
 *   get:
 *     summary: Lista títulos a pagar com filtros opcionais
 *     tags: [TitulosPagar]
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
 *         required: false
 *         description: ID da filial
 *       - in: query
 *         name: identidade
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da entidade
 *       - in: query
 *         name: idmoeda
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da moeda
 *       - in: query
 *         name: datainicial
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Data inicial
 *       - in: query
 *         name: datafinal
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Data final
 *     responses:
 *       200:
 *         description: Lista de títulos a pagar
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', titulospagarController.getTituloPagar);

/**
 * @swagger
 * /api/titulospagar/{idtitulo}:
 *   get:
 *     summary: Obter um título a pagar pelo ID
 *     tags: [TitulosPagar]
 *     parameters:
 *       - in: path
 *         name: idtitulo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a pagar
 *     responses:
 *       200:
 *         description: Dados do título a pagar
 *       404:
 *         description: Título não encontrado
 */
router.get('/:idtitulo', titulospagarController.getTituloPagarById);

/**
 * @swagger
 * /api/titulospagar:
 *   post:
 *     summary: Cria um novo título a pagar
 *     tags: [TitulosPagar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dataemissao
 *               - datavencimento
 *               - descricao
 *               - valor
 *               - empresa
 *               - chave
 *             properties:
 *               dataemissao:
 *                 type: string
 *                 format: date
 *               datavencimento:
 *                 type: string
 *                 format: date
 *               datacompetencia:
 *                 type: string
 *                 format: date
 *               descricao:
 *                 type: string
 *               documento:
 *                 type: string
 *               valor:
 *                 type: number
 *               valorpago:
 *                 type: number
 *               descontopago:
 *                 type: number
 *               juropago:
 *                 type: number
 *               parcela:
 *                 type: string
 *               idvendabilhete:
 *                 type: integer
 *               idvendahotel:
 *                 type: integer
 *               idvendapacote:
 *                 type: integer
 *               identidade:
 *                 type: integer
 *               idmoeda:
 *                 type: integer
 *               idformapagamento:
 *                 type: integer
 *               idplanoconta:
 *                 type: integer
 *               idcentrocusto:
 *                 type: integer
 *               idfilial:
 *                 type: integer
 *               idnotacredito:
 *                 type: integer
 *               idnotadebito:
 *                 type: integer
 *               idreembolso:
 *                 type: integer
 *               chave:
 *                 type: string
 *               empresa:
 *                 type: string
 *     responses:
 *       201:
 *         description: Título criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', titulospagarController.createTituloPagar);

/**
 * @swagger
 * /api/titulospagar/{idtitulo}:
 *   put:
 *     summary: Atualiza um título a pagar existente
 *     tags: [TitulosPagar]
 *     parameters:
 *       - in: path
 *         name: idtitulo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataemissao:
 *                 type: string
 *                 format: date
 *               datavencimento:
 *                 type: string
 *                 format: date
 *               datacompetencia:
 *                 type: string
 *                 format: date
 *               descricao:
 *                 type: string
 *               documento:
 *                 type: string
 *               valor:
 *                 type: number
 *               valorpago:
 *                 type: number
 *               descontopago:
 *                 type: number
 *               juropago:
 *                 type: number
 *               parcela:
 *                 type: string
 *               idvendabilhete:
 *                 type: integer
 *               idvendahotel:
 *                 type: integer
 *               idvendapacote:
 *                 type: integer
 *               identidade:
 *                 type: integer
 *               idmoeda:
 *                 type: integer
 *               idformapagamento:
 *                 type: integer
 *               idplanoconta:
 *                 type: integer
 *               idcentrocusto:
 *                 type: integer
 *               idfilial:
 *                 type: integer
 *               idnotacredito:
 *                 type: integer
 *               idnotadebito:
 *                 type: integer
 *               idreembolso:
 *                 type: integer
 *               chave:
 *                 type: string
 *               empresa:
 *                 type: string
 *     responses:
 *       200:
 *         description: Título atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Título não encontrado
 */
router.put('/:idtitulo', titulospagarController.updateTituloPagar);

/**
 * @swagger
 * /api/titulospagar/{idtitulo}:
 *   delete:
 *     summary: Remove um título a pagar existente
 *     tags: [TitulosPagar]
 *     parameters:
 *       - in: path
 *         name: idtitulo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do título a ser removido
 *     responses:
 *       200:
 *         description: Título removido com sucesso
 *       404:
 *         description: Título não encontrado
 */
router.delete('/:idtitulo', titulospagarController.deleteTituloPagar);

module.exports = router;
