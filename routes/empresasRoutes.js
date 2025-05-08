const express = require('express');
const router = express.Router();
const empresasController = require('../controllers/empresasController');

/**
 * @swagger
 * tags:
 *   name: Empresa
 *   description: Endpoints para gerenciamento de empresas
 */

/**
 * @swagger
 * /api/empresas:
 *   get:
 *     summary: Lista empresas com filtros opcionais
 *     tags: [Empresa]
 *     parameters:
 *       - in: query
 *         name: codigoempresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: idempresa
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da empresa
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da empresa
 *       - in: query
 *         name: cnpjcpf
 *         schema:
 *           type: string
 *         required: false
 *         description: CNPJ ou CPF da empresa
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: false
 *         description: Email da empresa
 *     responses:
 *       200:
 *         description: Lista de empresas
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
router.get('/', empresasController.getEmpresas);

/**
 * @swagger
 * /api/empresas:
 *   post:
 *     summary: Cria uma nova empresa
 *     tags: [Empresa]
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
 *               - codigoempresa
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
 *               codigoempresa:
 *                 type: string
 *               licenca:
 *                 type: string
 *               emissivo:
 *                 type: boolean
 *               receptivo:
 *                 type: boolean
 *               financeiro:
 *                 type: boolean
 *               advocaticio:
 *                 type: boolean
 *               bloqueado:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Empresa criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', empresasController.createEmpresa);

/**
 * @swagger
 * /api/empresas/{idempresa}:
 *   put:
 *     summary: Atualiza uma empresa existente
 *     tags: [Empresa]
 *     parameters:
 *       - in: path
 *         name: idempresa
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa a ser atualizada
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
 *               codigoempresa:
 *                 type: string
 *               licenca:
 *                 type: string
 *               emissivo:
 *                 type: boolean
 *               receptivo:
 *                 type: boolean
 *               financeiro:
 *                 type: boolean
 *               advocaticio:
 *                 type: boolean
 *               bloqueado:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Empresa atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Empresa não encontrada
 */
router.put('/:idempresa', empresasController.updateEmpresa);

/**
 * @swagger
 * /api/empresas/{idempresa}:
 *   delete:
 *     summary: Remove uma empresa existente
 *     tags: [Empresa]
 *     parameters:
 *       - in: path
 *         name: idempresa
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa a ser removida
 *     responses:
 *       200:
 *         description: Empresa removida com sucesso
 *       404:
 *         description: Empresa não encontrada
 */
router.delete('/:idempresa', empresasController.deleteEmpresa);

module.exports = router;
