const express = require('express');
const router = express.Router();
const vendashotelController = require('../controllers/vendashotelController');

/**
 * @swagger
 * tags:
 *   name: VendasHoteis
 *   description: Endpoints para gerenciamento de vendas de hotéis
 */

/**
 * @swagger
 * /api/vendashoteis:
 *   get:
 *     summary: Lista vendas de hotéis com filtros opcionais
 *     tags: [VendasHoteis]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da venda
 *     responses:
 *       200:
 *         description: Lista de vendas de hotéis
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', vendashotelController.getVendasHotel);

router.get('/:idvenda', vendashotelController.getVendasHotelById);

/**
 * @swagger
 * /api/vendashoteis:
 *   post:
 *     summary: Cria uma nova venda de hotel
 *     tags: [VendasHoteis]
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
 *               valortaxatotal:
 *                 type: number
 *               valoroutrostotal:
 *                 type: number
 *               valordutotal:
 *                 type: number
 *               valorcomissaototal:
 *                 type: number
 *               valorfornecedortotal:
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
 *                 type: string
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
router.post('/', vendashotelController.createVendasHotel);

/**
 * @swagger
 * /api/vendashoteis/{idvenda}:
 *   put:
 *     summary: Atualiza uma venda de hotel existente
 *     tags: [VendasHoteis]
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
 *               valortaxatotal:
 *                 type: number
 *               valoroutrostotal:
 *                 type: number
 *               valordutotal:
 *                 type: number
 *               valorcomissaototal:
 *                 type: number
 *               valorfornecedortotal:
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
 *                 type: string
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
router.put('/:idvenda', vendashotelController.updateVendasHotel);

/**
 * @swagger
 * /api/vendashoteis/{idvenda}:
 *   delete:
 *     summary: Remove uma venda de hotel existente
 *     tags: [VendasHoteis]
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
router.delete('/:idvenda', vendashotelController.deleteVendasHotel);

module.exports = router;
