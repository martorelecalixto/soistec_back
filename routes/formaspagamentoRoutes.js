const express = require('express');
const router = express.Router();
const formaspagamentoController = require('../controllers/formaspagamentoController');

/**
 * @swagger
 * tags:
 *   name: FormaPagamento
 *   description: Endpoints para gerenciamento de formas de pagamento
 */

/**
 * @swagger
 * /api/formaspagamento:
 *   get:
 *     summary: Lista formas de pagamento com filtros opcionais
 *     tags: [FormasPagamento]
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
 *         description: Nome da forma de pagamento
 *     responses:
 *       200:
 *         description: Lista de formas de pagamento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idformapagamento:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   Tipo:
 *                     type: string
 *                   empresa:
 *                     type: string
 */
router.get('/', formaspagamentoController.getFormasPagamento);

/**
 * @swagger
 * /api/formaspagamento/{idformapagamento}:
 *   get:
 *     summary: Retorna uma forma de pagamento pelo ID
 *     tags: [FormasPagamento]
 *     parameters:
 *       - in: path
 *         name: idformapagamento
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da forma de pagamento
 *     responses:
 *       200:
 *         description: Forma de pagamento encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idformapagamento:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 tipo:
 *                   type: string
 *                 empresa:
 *                   type: string
 *       404:
 *         description: Forma de pagamento não encontrada
 */
router.get('/:idformapagamento', formaspagamentoController.getFormaPagamentoById);

/**
 * @swagger
 * /api/formaspagamento:
 *   post:
 *     summary: Cria uma nova forma de pagamento
 *     tags: [FormasPagamento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - tipo
 *               - empresa
 *             properties:
 *               nome:
 *                 type: string
 *               tipo:
 *                 type: string
 *               empresa:
 *                 type: string
 *               debito:
 *                 type: boolean
 *               credito:
 *                 type: boolean
 *               gerartitulofatura:
 *                 type: boolean
 *               gerartitulovenda:
 *                 type: boolean
 *               baixaautomatica:
 *                 type: boolean
 *               vendaparcelada:
 *                 type: boolean
 *               gerarfatura:
 *                 type: boolean
 *               addtaxanovalor:
 *                 type: boolean
 *               addassentonovalor:
 *                 type: boolean
 *               addravnovalor:
 *                 type: boolean
 *               addcomissaonovalor:
 *                 type: boolean
 *               gerartituloservicofor:
 *                 type: boolean
 *               gerartituloservicocomis:
 *                 type: boolean
 *               idplanocontaaereo:
 *                 type: integer
 *               idplanocontaforaereo:
 *                 type: integer
 *               idplanocontaservico:
 *                 type: integer
 *               idplanocontaforservico:
 *                 type: integer
 *               idplanocontacomisservico:
 *                 type: integer
 *               idplanocontapacote:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Forma de pagamento criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', formaspagamentoController.createFormaPagamento);

/**
 * @swagger
 * /api/formaspagamento/{idformapagamento}:
 *   put:
 *     summary: Atualiza uma forma de pagamento existente
 *     tags: [FormasPagamento]
 *     parameters:
 *       - in: path
 *         name: idformapagamento
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da forma de pagamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               tipo:
 *                 type: string
 *               debito:
 *                 type: boolean
 *               credito:
 *                 type: boolean
 *               gerartitulofatura:
 *                 type: boolean
 *               gerartitulovenda:
 *                 type: boolean
 *               baixaautomatica:
 *                 type: boolean
 *               vendaparcelada:
 *                 type: boolean
 *               empresa:
 *                 type: string
 *               gerarfatura:
 *                 type: boolean
 *               addtaxanovalor:
 *                 type: boolean
 *               addassentonovalor:
 *                 type: boolean
 *               addravnovalor:
 *                 type: boolean
 *               addcomissaonovalor:
 *                 type: boolean
 *               gerartituloservicofor:
 *                 type: boolean
 *               gerartituloservicocomis:
 *                 type: boolean
 *               idplanocontaaereo:
 *                 type: integer
 *               idplanocontaforaereo:
 *                 type: integer
 *               idplanocontaservico:
 *                 type: integer
 *               idplanocontaforservico:
 *                 type: integer
 *               idplanocontacomisservico:
 *                 type: integer
 *               idplanocontapacote:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Forma de pagamento atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Forma de pagamento não encontrada
 */
router.put('/:id', formaspagamentoController.updateFormaPagamento);

/**
 * @swagger
 * /api/formaspagamento/{idformapagamento}:
 *   delete:
 *     summary: Remove uma forma de pagamento existente
 *     tags: [FormasPagamento]
 *     parameters:
 *       - in: path
 *         name: idformapagamento
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da forma de pagamento
 *     responses:
 *       200:
 *         description: Forma de pagamento removida com sucesso
 *       404:
 *         description: Forma de pagamento não encontrada
 */
router.delete('/:idformapagamento', formaspagamentoController.deleteFormaPagamento);

module.exports = router;
