const express = require('express');
const router = express.Router();
const moedasController = require('../controllers/moedasController');

/**
 * @swagger
 * tags:
 *   name: Moedas
 *   description: Endpoints para gerenciamento de moedas
 */


/**
 * @swagger
 * /api/moedas:
 *   post:
 *     summary: Cria uma nova moeda
 *     tags: [Moedas]
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
 *               codiso:
 *                 type: string
 *               sigla:
 *                 type: string
 *               intsingular:
 *                 type: string
 *               intplural:
 *                 type: string
 *               secsingular:
 *                 type: string
 *               secplural:
 *                 type: string
 *               empresa:
 *                 type: string
 *     responses:
 *       201:
 *         description: Moeda criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', moedasController.createMoeda);

/**
 * @swagger
 * /api/moedas/{idmoeda}:
 *   put:
 *     summary: Atualiza uma moeda existente
 *     tags: [Moedas]
 *     parameters:
 *       - in: path
 *         name: idmoeda
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da moeda a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               empresa:
 *                 type: string
 *     responses:
 *       200:
 *         description: Moeda atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Moeda não encontrada
 */
router.put('/:idmoeda', moedasController.updateMoeda);

/**
 * @swagger
 * /api/moedas/{id}:
 *   delete:
 *     summary: Remove uma Moeda existente
 *     tags: [Moedas]
 *     parameters:
 *       - in: path
 *         name: idmoeda
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da moeda a ser removida
 *     responses:
 *       200:
 *         description: Moeda removida com sucesso
 *       404:
 *         description: Moeda não encontrada
 */
router.delete('/:idmoeda', moedasController.deleteMoeda);

/**
 * @swagger
 * /api/moedas:
 *   get:
 *     summary: Lista moedas com filtros opcionais
 *     tags: [Moedas]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: idmoeda
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da moeda
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da moeda
 *     responses:
 *       200:
 *         description: Lista de moedas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nome:
 *                     type: string
 */
router.get('/:idmoeda', moedasController.getMoedaById);

/**
 * @swagger
 * /api/moedas:
 *   get:
 *     summary: Lista moedas com filtros opcionais
 *     tags: [Moedas]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: idmoeda
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da moeda
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da moeda
 *     responses:
 *       200:
 *         description: Lista de moedas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nome:
 *                     type: string
 */
router.get('/', moedasController.getMoedas);

/**
 * @swagger
 * /api/moedas:
 *   get:
 *     summary: Lista moedas com filtros opcionais
 *     tags: [Moedas]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: idmoeda
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da moeda
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da moeda
 *     responses:
 *       200:
 *         description: Lista de moedas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idmoeda:
 *                     type: integer
 *                   nome:
 *                     type: string
 */
router.get('/', moedasController.getMoedasDropDown);

module.exports = router;
