const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/gruposController');

/**
 * @swagger
 * tags:
 *   name: Grupos
 *   description: Endpoints para gerenciamento de grupos
 */

/**
 * @swagger
 * /api/grupos:
 *   get:
 *     summary: Lista grupos com filtros opcionais
 *     tags: [Grupos]
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
 *         description: Nome do grupo
 *     responses:
 *       200:
 *         description: Lista de grupos
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
router.get('/', gruposController.getGruposDropDown);

/**
 * @swagger
 * /api/grupos:
 *   get:
 *     summary: Lista grupos com filtros opcionais
 *     tags: [Grupos]
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
 *         description: Nome do grupo
 *     responses:
 *       200:
 *         description: Lista de grupos
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
router.get('/', gruposController.getGrupos);

/**
 * @swagger
 * /api/grupos/{id}:
 *   get:
 *     summary: Retorna um grupo pelo ID
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo
 *     responses:
 *       200:
 *         description: Grupo encontrado
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
 *         description: Grupo não encontrado
 */
router.get('/:id', gruposController.getGrupoById);

/**
 * @swagger
 * /api/grupos:
 *   post:
 *     summary: Cria um novo grupo
 *     tags: [Grupos]
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
 *         description: Grupo criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', gruposController.createGrupo);

/**
 * @swagger
 * /api/grupos/{id}:
 *   put:
 *     summary: Atualiza um grupo existente
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo
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
 *         description: Grupo atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Grupo não encontrado
 */
router.put('/:id', gruposController.updateGrupo);

/**
 * @swagger
 * /api/grupos/{id}:
 *   delete:
 *     summary: Remove um grupo existente
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do grupo
 *     responses:
 *       200:
 *         description: Grupo removido com sucesso
 *       404:
 *         description: Grupo não encontrado
 */
router.delete('/:id', gruposController.deleteGrupo);

module.exports = router;
