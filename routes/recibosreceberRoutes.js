const express = require('express');
const router = express.Router();
const recibosreceberController = require('../controllers/recibosreceberController');

/**
 * @swagger
 * tags:
 *   name: RecibosReceber
 *   description: Endpoints para gerenciamento de recibos a receber
 */

/**
 * @swagger
 * /api/recibosreceber:
 *   get:
 *     summary: Lista recibos a receber com filtros opcionais
 *     tags: [RecibosReceber]
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
router.get('/', recibosreceberController.getReciboReceber);

/**
 * @swagger
 * /api/recibosreceber/{idrecibo}:
 *   get:
 *     summary: Retorna um recibo pelo ID
 *     tags: [RecibosReceber]
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
router.get('/:idrecibo', recibosreceberController.getReciboReceberById);

/**
 * @swagger
 * /api/recibosreceber:
 *   post:
 *     summary: Cria um novo recibo
 *     tags: [RecibosReceber]
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
router.post('/', recibosreceberController.createReciboReceber);

/**
 * @swagger
 * /api/recibosreceber/{idrecibo}:
 *   put:
 *     summary: Atualiza um recibo existente
 *     tags: [RecibosReceber]
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
router.put('/:idrecibo', recibosreceberController.updateReciboReceber);

/**
 * @swagger
 * /api/recibosreceber/{idrecibo}:
 *   delete:
 *     summary: Remove um recibo existente
 *     tags: [RecibosReceber]
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
router.delete('/:idrecibo', recibosreceberController.deleteReciboReceber);

module.exports = router;
