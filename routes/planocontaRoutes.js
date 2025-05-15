const express = require('express');
const router = express.Router();
const planocontaController = require('../controllers/planocontaController');

/**
 * @swagger
 * tags:
 *   name: PlanoConta
 *   description: Endpoints para gerenciamento de plano conta
 */

/**
 * @swagger
 * /api/planoconta:
 *   get:
 *     summary: Lista centro custo com filtros opcionais
 *     tags: [PlanoConta]
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
 *         description: Nome do plano conta
 *     responses:
 *       200:
 *         description: Lista de plano conta
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
router.get('/', planocontaController.getPlanoConta);

/**
 * @swagger
 * /api/planoconta/{idplanoconta}:
 *   get:
 *     summary: Retorna uma plano conta pelo ID
 *     tags: [PlanoConta]
 *     parameters:
 *       - in: path
 *         name: idplanoconta
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da plano conta
 *     responses:
 *       200:
 *         description: Acomodação encontrada
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
 *         description: plano conta não encontrado
 */
router.get('/:idplanoconta', planocontaController.getPlanoContaById);

/**
 * @swagger
 * /api/planoconta:
 *   post:
 *     summary: Cria um novo plano conta
 *     tags: [PlanoConta]
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
 *               idplanocontapai:
 *                 type: integer
 *               tipo:
 *                 type: string
 *               idpaigeral:
 *                 type: integer
 *               chave:
 *                 type: string
 *               estrutura:
 *                 type: string
 *               natureza:
 *                 type: string
 *               naoresultado:
 *                 type: string
 *     responses:
 *       201:
 *         description: Plano Conta criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', planocontaController.createPlanoConta);

/**
 * @swagger
 * /api/planoconta/{idplanoconta}:
 *   put:
 *     summary: Atualiza uma plano conta existente
 *     tags: [PlanoConta]
 *     parameters:
 *       - in: path
 *         name: idplanoconta
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do plano conta
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
 *         description: plano conta atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: plano conta não encontrado
 */
router.put('/:idplanoconta', planocontaController.updatePlanoConta);

/**
 * @swagger
 * /api/planoconta/{idplanoconta}:
 *   delete:
 *     summary: Remove um centro custo existente
 *     tags: [PlanoConta]
 *     parameters:
 *       - in: path
 *         name: idplanoconta
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da plano conta
 *     responses:
 *       200:
 *         description: plano conta removido com sucesso
 *       404:
 *         description: plano conta não encontrado
 */
router.delete('/:idplanoconta', planocontaController.deletePlanoConta);

module.exports = router;
