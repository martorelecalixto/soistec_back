const express = require('express');
const router = express.Router();
const filiaisController = require('../controllers/filiaisController');

/**
 * @swagger
 * tags:
 *   name: Filiais
 *   description: Endpoints para gerenciamento de filiais
 */

/**
 * @swagger
 * /api/filiais:
 *   get:
 *     summary: Lista filiais com filtros opcionais
 *     tags: [Filiais]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: idfilial
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da filial
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da filial
 *       - in: query
 *         name: cnpjcpf
 *         schema:
 *           type: string
 *         required: false
 *         description: CNPJ ou CPF da filial
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: false
 *         description: Email da filial
 *     responses:
 *       200:
 *         description: Lista de filiais
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nome:
 *                     type: string
 *                   email:
 *                     type: string
 *                   cnpjcpf:
 *                     type: string
 *                   celular1:
 *                     type: string
 *                   celular2:
 *                     type: string
 *                   telefone1:
 *                     type: string
 *                   telefone2:
 *                     type: string
 */
router.get('/', filiaisController.getFiliais);

/**
 * @swagger
 * /api/filiais:
 *   post:
 *     summary: Cria uma nova filial
 *     tags: [Filiais]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - razaosocial
 *               - logradouro
 *               - numero
 *               - estado
 *               - cidade
 *               - bairro
 *               - cep
 *               - empresa
 *             properties:
 *               nome:
 *                 type: string
 *               razaosocial:
 *                 type: string
 *               cnpjcpf:
 *                 type: string
 *               celular1:
 *                 type: string
 *               celular2:
 *                 type: string
 *               telefone1:
 *                 type: string
 *               telefone2:
 *                 type: string
 *               redessociais:
 *                 type: string
 *               home:
 *                 type: string
 *               email:
 *                 type: string
 *               linkimagem:
 *                 type: string
 *               logradouro:
 *                 type: string
 *               complemento:
 *                 type: string
 *               numero:
 *                 type: string
 *               estado:
 *                 type: string
 *               cidade:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cep:
 *                 type: string
 *               referencia:
 *                 type: string
 *               empresa:
 *                 type: string
 *               valoricms:
 *                 type: number
 *               valoriss:
 *                 type: number
 *               valorcofins:
 *                 type: number
 *               valorpis:
 *                 type: number
 *               valoripi:
 *                 type: number
 *               valorir:
 *                 type: number
 *               valorcsll:
 *                 type: number
 *               valorinss:
 *                 type: number
 *     responses:
 *       201:
 *         description: Filial criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', filiaisController.createFilial);

/**
 * @swagger
 * /api/filiais/{idfilial}:
 *   put:
 *     summary: Atualiza uma filial existente
 *     tags: [Filiais]
 *     parameters:
 *       - in: path
 *         name: idfilial
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da filial a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               razaosocial:
 *                 type: string
 *               cnpjcpf:
 *                 type: string
 *               celular1:
 *                 type: string
 *               celular2:
 *                 type: string
 *               telefone1:
 *                 type: string
 *               telefone2:
 *                 type: string
 *               redessociais:
 *                 type: string
 *               home:
 *                 type: string
 *               email:
 *                 type: string
 *               linkImagem:
 *                 type: string
 *               logradouro:
 *                 type: string
 *               complemento:
 *                 type: string
 *               numero:
 *                 type: string
 *               estado:
 *                 type: string
 *               cidade:
 *                 type: string
 *               bairro:
 *                 type: string
 *               cep:
 *                 type: string
 *               referencia:
 *                 type: string
 *               empresa:
 *                 type: string
 *               valoricms:
 *                 type: number
 *               valoriss:
 *                 type: number
 *               valorcofins:
 *                 type: number
 *               valorpis:
 *                 type: number
 *               valoripi:
 *                 type: number
 *               valorir:
 *                 type: number
 *               valorcsll:
 *                 type: number
 *               valorinss:
 *                 type: number
 *     responses:
 *       200:
 *         description: Filial atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Filial não encontrada
 */
router.put('/:idfilial', filiaisController.updateFilial);

/**
 * @swagger
 * /api/filiais/{idfilial}:
 *   delete:
 *     summary: Remove uma filial existente
 *     tags: [Filiais]
 *     parameters:
 *       - in: path
 *         name: idfilial
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da filial a ser removida
 *     responses:
 *       200:
 *         description: Filial removida com sucesso
 *       404:
 *         description: Filial não encontrada
 */
router.delete('/:idfilial', filiaisController.deleteFilial);

/**
 * @swagger
 * /api/filiais:
 *   get:
 *     summary: Lista filiais com filtros opcionais
 *     tags: [Filiais]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: idfilial
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da filial
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da filial
 *     responses:
 *       200:
 *         description: Lista de filiais
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idfilial:
 *                     type: integer
 *                   nome:
 *                     type: string
 */
router.get('/', filiaisController.getFiliaisDropDown);

router.get('/:idfilial', filiaisController.getFilialById);

module.exports = router;
