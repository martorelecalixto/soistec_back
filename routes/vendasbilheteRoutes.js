const express = require('express');
const router = express.Router();
const vendasbController = require('../controllers/vendasbilheteController');

/**
 * @swagger
 * tags:
 *   name: VendasBilhetes
 *   description: Endpoints para gerenciamento de vendas
 */

/**
 * @swagger
 * /api/vendasbilhetes:
 *   get:
 *     summary: Lista vendas com filtros opcionais
 *     tags: [VendasBilhetes]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: idvenda
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da venda
 *     responses:
 *       200:
 *         description: Lista de vendas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   datavenda:
 *                     type: string
 *                     format: date-time
 *                   valortotal:
 *                     type: number
 *                   id:
 *                     type: integer
 *                   idfatura:
 *                     type: integer
 *                   entidade:
 *                     type: string
 *                   idreciboreceber:
 *                     type: integer
 *                   pagamento:
 *                     type: string
 */
router.get('/', vendasbilheteController.getVendasBilhete);

/**
 * @swagger
 * /api/vendasbilhetes:
 *   post:
 *     summary: Cria uma nova venda
 *     tags: [VendasBilhetes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - datavenda
 *               - datavencimento
 *               - chave
 *               - empresa
 *               - idemissor
 *               - idvendedor
 *               - idmoeda
 *             properties:
 *               datavenda:
 *                 type: string
 *                 format: date-time
 *               datavencimento:
 *                 type: string
 *                 format: date-time
 *               documento:
 *                 type: string
 *               valortotal:
 *                 type: number
 *               descontototal:
 *                 type: number
 *               cartao_sigla:
 *                 type: string
 *               cartao_numero:
 *                 type: string
 *               cartao_mesvencimento:
 *                 type: integer
 *               cartao_anovencimento:
 *                 type: integer
 *               observacao:
 *                 type: string
 *               solicitante:
 *                 type: string
 *               identidade:
 *                 type: integer
 *               idvendedor:
 *                 type: integer
 *               idemissor:
 *                 type: integer
 *               idmoeda:
 *                 type: integer
 *               idformapagamento:
 *                 type: integer
 *               idfilial:
 *                 type: integer
 *               idfatura:
 *                 type: integer
 *               idreciboreceber:
 *                 type: integer
 *               chave:
 *                 type: string
 *               excluido:
 *                 type: boolean
 *               empresa:
 *                 type: string
 *               idcentrocusto:
 *                 type: integer
 *               idgrupo:
 *                 type: integer
 *               id:
 *                 type: integer
 *               valorentrada:
 *                 type: number
 *     responses:
 *       201:
 *         description: Venda criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', vendasbilheteController.createVendaBilhete);

/**
 * @swagger
 * /api/vendasbilhetes/{idvenda}:
 *   put:
 *     summary: Atualiza uma venda existente
 *     tags: [VendasBilhetes]
 *     parameters:
 *       - in: path
 *         name: idvenda
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da venda a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               datavenda:
 *                 type: string
 *                 format: date-time
 *               datavencimento:
 *                 type: string
 *                 format: date-time
 *               documento:
 *                 type: string
 *               valortotal:
 *                 type: number
 *               descontototal:
 *                 type: number
 *               cartao_sigla:
 *                 type: string
 *               cartao_numero:
 *                 type: string
 *               cartao_mesvencimento:
 *                 type: integer
 *               cartao_anovencimento:
 *                 type: integer
 *               observacao:
 *                 type: string
 *               solicitante:
 *                 type: string
 *               identidade:
 *                 type: integer
 *               idvendedor:
 *                 type: integer
 *               idemissor:
 *                 type: integer
 *               idmoeda:
 *                 type: integer
 *               idformapagamento:
 *                 type: integer
 *               idfilial:
 *                 type: integer
 *               idfatura:
 *                 type: integer
 *               idreciboreceber:
 *                 type: integer
 *               chave:
 *                 type: string
 *               excluido:
 *                 type: boolean
 *               empresa:
 *                 type: string
 *               idcentrocusto:
 *                 type: integer
 *               idgrupo:
 *                 type: integer
 *               id:
 *                 type: integer
 *               valorentrada:
 *                 type: number
 *     responses:
 *       200:
 *         description: Venda atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Venda não encontrada
 */
router.put('/:idvenda', vendasbilheteController.updateVendaBilhete);

/**
 * @swagger
 * /api/vendasbilhetes/{idvenda}:
 *   delete:
 *     summary: Remove uma venda existente
 *     tags: [VendasBilhetes]
 *     parameters:
 *       - in: path
 *         name: idvenda
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da venda a ser removida
 *     responses:
 *       200:
 *         description: Venda removida com sucesso
 *       404:
 *         description: Venda não encontrada
 */
router.delete('/:idvenda', vendasbilheteController.deleteVendaBilhete);

module.exports = router;
