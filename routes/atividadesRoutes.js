const express = require('express');
const router = express.Router();
const atividadesController = require('../controllers/atividadesController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Atividades
 *   description: Endpoints para gerenciamento de atividades
 */

/**
 * @swagger
 * /api/atividades:
 *   get:
 *     summary: Lista atividades com filtros opcionais
 *     tags: [Atividades]
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
 *         description: ID da atividade
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da atividade
 *     responses:
 *       200:
 *         description: Lista de atividades
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
router.get('/', atividadesController.getAtividades);

/**
 * @swagger
 * /api/atividades:
 *   post:
 *     summary: Cria uma nova atividade
 *     tags: [Atividades]
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
 *         description: Atividade criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', atividadesController.createAtividade);

/**
 * @swagger
 * /api/atividades/{id}:
 *   put:
 *     summary: Atualiza uma atividade existente
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade a ser atualizada
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
 *         description: Atividade atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Atividade não encontrada
 */
router.put('/:id', atividadesController.updateAtividade);

/**
 * @swagger
 * /api/atividades/{id}:
 *   delete:
 *     summary: Remove uma atividade existente
 *     tags: [Atividades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da atividade a ser removida
 *     responses:
 *       200:
 *         description: Atividade removida com sucesso
 *       404:
 *         description: Atividade não encontrada
 */
router.delete('/:id', atividadesController.deleteAtividade);

/**
 * @swagger
 * /api/atividades:
 *   get:
 *     summary: Lista atividades com filtros opcionais
 *     tags: [Atividades]
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
 *         description: ID da atividade
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da atividade
 *     responses:
 *       200:
 *         description: Lista de atividades
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
router.get('/', atividadesController.getAtividadesDropDown);

// 🔐 Protege a rota de listagem geral (usuário precisa ter permissão "Atividade.View")
router.get('/', authMiddleware('Atividade.View'), atividadesController.getAtividades);

// 🔐 Protege edição (precisa "Atividade.Editar")
router.put('/:id', authMiddleware('Atividade.Editar'), atividadesController.updateAtividade);

// 🔐 Protege exclusão (precisa "Atividade.Excluir")
router.delete('/:id', authMiddleware('Atividade.Excluir'), atividadesController.deleteAtividade);

module.exports = router;
