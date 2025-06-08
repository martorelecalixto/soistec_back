const express = require('express');
const router = express.Router();
const recibospagarController = require('../controllers/recibospagarController');

/**
 * @swagger
 * tags:
 *   name: RecibosPagar
 *   description: Endpoints para gerenciamento de recibos a pagar
 */

/**
 * @swagger
 * /api/recibospagar:
 *   get:
 *     summary: Lista recibos a pagar com filtros opcionais
 *     tags: [RecibosPagar]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa
 *       - in: query
 *         name: descricao
 *         schema:
 *           type: string
 *         required: false
 *         description: Parte da descrição do recibo
 *     responses:
 *       200:
 *         description: Lista de recibos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idrecibo:
 *                     type: integer
 *                   dataemissao:
 *                     type: string
 *                     format: date-time
 *                   descricao:
 *                     type: string
 *                   valor:
 *                     type: number
 *                   identidade:
 *                     type: integer
 *                   idmoeda:
 *                     type: integer
 *                   idfilial:
 *                     type: integer
 *                   chave:
 *                     type: string
 *                   empresa:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                   id:
 *                     type: integer
 */
router.get('/', recibospagarController.getReciboPagar);

/**
 * @swagger
 * /api/recibospagar/{idrecibo}:
 *   get:
 *     summary: Retorna um recibo pelo ID
 *     tags: [RecibosPagar]
 *     parameters:
 *       - in: path
 *         name: idrecibo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do recibo
 *     responses:
 *       200:
 *         description: Recibo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idrecibo:
 *                   type: integer
 *                 dataemissao:
 *                   type: string
 *                   format: date-time
 *                 descricao:
 *                   type: string
 *                 valor:
 *                   type: number
 *                 identidade:
 *                   type: integer
 *                 idmoeda:
 *                   type: integer
 *                 idfilial:
 *                   type: integer
 *                 chave:
 *                   type: string
 *                 empresa:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                 id:
 *                   type: integer
 *       404:
 *         description: Recibo não encontrado
 */
router.get('/:idrecibo', recibospagarController.getReciboPagarById);

/**
 * @swagger
 * /api/recibospagar:
 *   post:
 *     summary: Cria um novo recibo
 *     tags: [RecibosPagar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dataemissao
 *               - valor
 *               - identidade
 *               - chave
 *               - empresa
 *             properties:
 *               dataemissao:
 *                 type: string
 *                 format: date-time
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *               identidade:
 *                 type: integer
 *               idmoeda:
 *                 type: integer
 *               idfilial:
 *                 type: integer
 *               chave:
 *                 type: string
 *               empresa:
 *                 type: string
 *               tipo:
 *                 type: string
 *               id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Recibo criado com sucesso
 */
router.post('/', recibospagarController.createReciboPagar);

/**
 * @swagger
 * /api/recibospagar/{idrecibo}:
 *   put:
 *     summary: Atualiza um recibo existente
 *     tags: [RecibosPagar]
 *     parameters:
 *       - in: path
 *         name: idrecibo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do recibo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataemissao:
 *                 type: string
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *               identidade:
 *                 type: integer
 *               idmoeda:
 *                 type: integer
 *               idfilial:
 *                 type: integer
 *               chave:
 *                 type: string
 *               empresa:
 *                 type: string
 *               tipo:
 *                 type: string
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Recibo atualizado com sucesso
 *       404:
 *         description: Recibo não encontrado
 */
router.put('/:idrecibo', recibospagarController.updateReciboPagar);

/**
 * @swagger
 * /api/recibospagar/{idrecibo}:
 *   delete:
 *     summary: Remove um recibo existente
 *     tags: [RecibosPagar]
 *     parameters:
 *       - in: path
 *         name: idrecibo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do recibo
 *     responses:
 *       200:
 *         description: Recibo removido com sucesso
 *       404:
 *         description: Recibo não encontrado
 */
router.delete('/:idrecibo', recibospagarController.deleteReciboPagar);

module.exports = router;
