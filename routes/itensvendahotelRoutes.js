const express = require('express');
const router = express.Router();
const itensvendahotelController = require('../controllers/itensvendahotelController');

/**
 * @swagger
 * tags:
 *   name: ItensVendaHotel
 *   description: Endpoints para gerenciamento de itens de venda de hotel
 */

/**
 * @swagger
 * /api/itensvendahotel:
 *   get:
 *     summary: Lista todos os itens de venda de hotel
 *     tags: [ItensVendaHotel]
 *     parameters:
 *       - in: query
 *         name: idvenda
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da venda
 *     responses:
 *       200:
 *         description: Lista de itens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', itensvendahotelController.getItensVendaHotel);

/**
 * @swagger
 * /api/itensvendahotel:
 *   post:
 *     summary: Cria um novo item de venda de hotel
 *     tags: [ItensVendaHotel]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idvenda
 *               - cancelado
 *             properties:
 *               quantidade: { type: integer }
 *               pax: { type: string }
 *               observacao: { type: string }
 *               bilhete: { type: string }
 *               trecho: { type: string }
 *               tipovoo: { type: string }
 *               valorbilhete: { type: number, format: float }
 *               valortaxabilhete: { type: number, format: float }
 *               valortaxaservico: { type: number, format: float }
 *               valordesconto: { type: number, format: float }
 *               valortotal: { type: number, format: float }
 *               idvenda: { type: integer }
 *               idciaaerea: { type: integer }
 *               idoperadora: { type: integer }
 *               voo: { type: string }
 *               tipobilhete: { type: string }
 *               cancelado: { type: boolean }
 *               valorcomisagente: { type: number, format: float }
 *               valorcomisvendedor: { type: number, format: float }
 *               valorassento: { type: number, format: float }
 *               valorcomisemissor: { type: number, format: float }
 *               valorfornecedor: { type: number, format: float }
 *               valornet: { type: number, format: float }
 *               localembarque: { type: string }
 *               dataembarque: { type: string, format: date-time }
 *               horaembarque: { type: string, format: date-time }
 *               localdesembarque: { type: string }
 *               datadesembarque: { type: string, format: date-time }
 *               horadesembarque: { type: string, format: date-time }
 *               chave: { type: string }
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 */
router.post('/', itensvendahotelController.createItemVendaHotel);

/**
 * @swagger
 * /api/itensvendahotel/{id}:
 *   put:
 *     summary: Atualiza um item de venda de hotel
 *     tags: [ItensVendaHotel]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantidade: { type: integer }
 *               pax: { type: string }
 *               observacao: { type: string }
 *               bilhete: { type: string }
 *               trecho: { type: string }
 *               tipovoo: { type: string }
 *               valorbilhete: { type: number, format: float }
 *               valortaxabilhete: { type: number, format: float }
 *               valortaxaservico: { type: number, format: float }
 *               valordesconto: { type: number, format: float }
 *               valortotal: { type: number, format: float }
 *               idvenda: { type: integer }
 *               idciaaerea: { type: integer }
 *               idoperadora: { type: integer }
 *               voo: { type: string }
 *               tipobilhete: { type: string }
 *               cancelado: { type: boolean }
 *               valorcomisagente: { type: number, format: float }
 *               valorcomisvendedor: { type: number, format: float }
 *               valorassento: { type: number, format: float }
 *               valorcomisemissor: { type: number, format: float }
 *               valorfornecedor: { type: number, format: float }
 *               valornet: { type: number, format: float }
 *               localembarque: { type: string }
 *               dataembarque: { type: string, format: date-time }
 *               horaembarque: { type: string, format: date-time }
 *               localdesembarque: { type: string }
 *               datadesembarque: { type: string, format: date-time }
 *               horadesembarque: { type: string, format: date-time }
 *               chave: { type: string }
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 */
router.put('/:id', itensvendahotelController.updateItemVendaHotel);

/**
 * @swagger
 * /api/itensvendahotel/{id}:
 *   delete:
 *     summary: Remove um item de venda de hotel
 *     tags: [ItensVendaHotel]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item a ser removido
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 */
router.delete('/:id', itensvendahotelController.deleteItemVendaHotel);

/**
 * @swagger
 * /api/itensvendahotel/{id}:
 *   get:
 *     summary: Retorna um item de venda pelo ID
 *     tags: [ItensVendaHotel]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item da venda
 *     responses:
 *       200:
 *         description: Forma de pagamento encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *       404:
 *         description: Forma de pagamento não encontrada
 */
router.get('/:id', itensvendahotelController.getItensVendaHotelById);

/**
 * @swagger
 * /api/itensvendahotel/{id}:
 *   delete:
 *     summary: Remove um item de venda de hotel
 *     tags: [ItensVendaHotel]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item a ser removido
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 */
router.delete('/:id', itensvendahotelController.deleteItemVendaHotel);

/**
 * @swagger
 * /api/itensvendahotel/porvenda/{idvenda}:
 *   get:
 *     summary: Retorna os itens de uma venda pelo ID da venda
 *     tags: [ItensVendaHotel]
 *     parameters:
 *       - in: path
 *         name: idvenda
 *         required: true
 *         schema:
 *           type: integer
 *         description: IDVENDA do item da venda
 *     responses:
 *       200:
 *         description: Itens encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Itens da venda não encontrados
 */
router.get('/porvenda/:idvenda', itensvendahotelController.getItensVendaHotelByIdVenda);

module.exports = router;
