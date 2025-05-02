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
 * /filiais:
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
 * /filiais:
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
 *               - razaoSocial
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
 *               razaoSocial:
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
 *               redesSociais:
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
 *               valorICMS:
 *                 type: number
 *               valorISS:
 *                 type: number
 *               valorCOFINS:
 *                 type: number
 *               valorPIS:
 *                 type: number
 *               valorIPI:
 *                 type: number
 *               valorIR:
 *                 type: number
 *               valorCSLL:
 *                 type: number
 *               valorINSS:
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
 * /filiais/{id}:
 *   put:
 *     summary: Atualiza uma filial existente
 *     tags: [Filiais]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               razaoSocial:
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
 *               redesSociais:
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
 *               valorICMS:
 *                 type: number
 *               valorISS:
 *                 type: number
 *               valorCOFINS:
 *                 type: number
 *               valorPIS:
 *                 type: number
 *               valorIPI:
 *                 type: number
 *               valorIR:
 *                 type: number
 *               valorCSLL:
 *                 type: number
 *               valorINSS:
 *                 type: number
 *     responses:
 *       200:
 *         description: Filial atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Filial não encontrada
 */
router.put('/:id', filiaisController.updateFilial);

/**
 * @swagger
 * /filiais/{id}:
 *   delete:
 *     summary: Remove uma filial existente
 *     tags: [Filiais]
 *     parameters:
 *       - in: path
 *         name: id
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
router.delete('/:id', filiaisController.deleteFilial);

module.exports = router;
