const express = require('express');
const router = express.Router();
const tiposervicohotelController = require('../controllers/tiposervicohotelController');

/**
 * @swagger
 * tags:
 *   name: Acomodacoes
 *   description: Endpoints para gerenciamento de tipo servicos
 */

/**
 * @swagger
 * /api/tiposervico:
 *   get:
 *     summary: Lista tipo servico com filtros opcionais
 *     tags: [TipoServico]
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
 *         description: Nome do tipo servico
 *     responses:
 *       200:
 *         description: Lista de tipo servico
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
router.get('/', tiposervicohotelController.getTipoServicoHoteis);

/**
 * @swagger
 * /api/tiposervico/{id}:
 *   get:
 *     summary: Retorna uma tipo servico pelo ID
 *     tags: [TipoServico]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tipo servico
 *     responses:
 *       200:
 *         description: Tipo servico encontrado
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
router.get('/:id', tiposervicohotelController.getTipoServicoHoteisById);

/**
 * @swagger
 * /api/tiposervico:
 *   post:
 *     summary: Cria uma nova tipo servico
 *     tags: [TipoServico]
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
 *     responses:
 *       201:
 *         description: Tipo servico criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', tiposervicohotelController.createTipoServicoHoteis);

/**
 * @swagger
 * /api/tiposervico/{id}:
 *   put:
 *     summary: Atualiza um tipo servico existente
 *     tags: [TipoServico]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tipo servico
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
 *         description: Tipo Servico atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Tipo Servico não encontrada
 */
router.put('/:id', tiposervicohotelController.updateTipoServicoHoteis);

/**
 * @swagger
 * /api/tiposervico/{id}:
 *   delete:
 *     summary: Remove um tipo servico existente
 *     tags: [TipoServico]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do tipo servico
 *     responses:
 *       200:
 *         description: Tipo servico removido com sucesso
 *       404:
 *         description: Tipo servico não encontrado
 */
router.delete('/:id', tiposervicohotelController.deleteTipoServicoHoteis);

/**
 * @swagger
 * /api/tiposervico:
 *   get:
 *     summary: Lista tipo servico com filtros opcionais
 *     tags: [TipoServico]
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
 *         description: ID da tipo servico
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da tipo servico
 *     responses:
 *       200:
 *         description: Lista de tipo servico
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
 */
router.get('/', tiposervicohotelController.getTipoServicoHoteisDropDown);

module.exports = router;
