const express = require('express');
const router = express.Router();
const entidadesController = require('../controllers/entidadesController');

/**
 * @swagger
 * tags:
 *   name: Entidade
 *   description: Endpoints para gerenciamento de entidades
 */

/**
 * @swagger
 * /api/entidades:
 *   get:
 *     summary: Lista entidades com filtros opcionais
 *     tags: [Entidades]
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome da empresa (obrigatório)
 *       - in: query
 *         name: identidade
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID da entidade
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: false
 *         description: Nome da entidade
 *       - in: query
 *         name: cnpjcpf
 *         schema:
 *           type: string
 *         required: false
 *         description: CNPJ ou CPF da entidade
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: false
 *         description: Email da entidade
 *     responses:
 *       200:
 *         description: Lista de entidades
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
router.get('/', entidadesController.getEntidades);

/**
 * @swagger
 * /api/entidades:
 *   post:
 *     summary: Cria uma nova entidade
 *     tags: [Entidades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - fantasia
 *               - empresa
 *             properties:
 *               nome:
 *                 type: string
 *               fantasia:
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
 *               datacadastro:
 *                 type: date-time
 *               datanascimento:
 *                 type: date-time
 *               email:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *               [for]:
 *                 type: boolean
 *               cli:
 *                 type: boolean
 *               vend:
 *                 type: boolean
 *               emis:
 *                 type: boolan
 *               mot:
 *                 type: boolean
 *               gui:
 *                 type: boolean
 *               cia:
 *                 type: boolean
 *               ope:
 *                 type: boolean
 *               hot:
 *                 type: boolean
 *               sigla:
 *                 type: string
 *               cartao_sigla_1:
 *                 type: string
 *               cartao_numero_1:
 *                 type: string
 *               cartao_mesvencimento_1:
 *                 type: integer
 *               cartao_anovencimento_1:
 *                 type: integer
 *               cartao_diafechamento_1:
 *                 type: integer
 *               cartao_titular_1:
 *                 type: string
 *               cartao_sigla_2:
 *                 type: string
 *               cartao_numero_2:
 *                 type: string
 *               cartao_mesvencimento_2:
 *                 type: integer
 *               cartao_anovencimento_2:
 *                 type: integer
 *               cartao_diafechamento_2:
 *                 type: integer
 *               cartao_titular_2:
 *                 type: string
 *               chave:
 *                 type: string
 *               atividadeid:
 *                 type: integer
 *               empresa:
 *                 type: string
 *               seg:
 *                 type: boolean
 *               ter:
 *                 type: boolean
 *               loc:
 *                 type: boolean
 *               sexo:
 *                 type: boolean
 *               pes:
 *                 type: boolean
 *               documento:
 *                 type: string
 *               tipodocumento:
 *                 type: string
*     responses:
 *       201:
 *         description: Entidade criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', entidadesController.createEntidade);

/**
 * @swagger
 * /api/entidades/{identidade}:
 *   put:
 *     summary: Atualiza uma entidade existente
 *     tags: [Entidades]
 *     parameters:
 *       - in: path
 *         name: identidade
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da entidade a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               fantasia:
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
 *               datacadastro:
 *                 type: date-time
 *               datanascimento:
 *                 type: date-time
 *               email:
 *                 type: string
 *               ativo:
 *                 type: boolean
 *               [for]:
 *                 type: boolean
 *               cli:
 *                 type: boolean
 *               vend:
 *                 type: boolean
 *               emis:
 *                 type: boolan
 *               mot:
 *                 type: boolean
 *               gui:
 *                 type: boolean
 *               cia:
 *                 type: boolean
 *               ope:
 *                 type: boolean
 *               hot:
 *                 type: boolean
 *               sigla:
 *                 type: string
 *               cartao_sigla_1:
 *                 type: string
 *               cartao_numero_1:
 *                 type: string
 *               cartao_mesvencimento_1:
 *                 type: integer
 *               cartao_anovencimento_1:
 *                 type: integer
 *               cartao_diafechamento_1:
 *                 type: integer
 *               cartao_titular_1:
 *                 type: string
 *               cartao_sigla_2:
 *                 type: string
 *               cartao_numero_2:
 *                 type: string
 *               cartao_mesvencimento_2:
 *                 type: integer
 *               cartao_anovencimento_2:
 *                 type: integer
 *               cartao_diafechamento_2:
 *                 type: integer
 *               cartao_titular_2:
 *                 type: string
 *               chave:
 *                 type: string
 *               atividadeid:
 *                 type: integer
 *               empresa:
 *                 type: string
 *               seg:
 *                 type: boolean
 *               ter:
 *                 type: boolean
 *               loc:
 *                 type: boolean
 *               sexo:
 *                 type: boolean
 *               pes:
 *                 type: boolean
 *               documento:
 *                 type: string
 *               tipodocumento:
 *                 type: string
 *     responses:
 *       200:
 *         description: Entidade atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Entidade não encontrada
 */
router.put('/:identidade', entidadesController.updateEntidade);

/**
 * @swagger
 * /api/entidades/{identidade}:
 *   delete:
 *     summary: Remove uma Entidade existente
 *     tags: [Entidades]
 *     parameters:
 *       - in: path
 *         name: identidade
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da Entidade a ser removida
 *     responses:
 *       200:
 *         description: Entidade removida com sucesso
 *       404:
 *         description: Entidade não encontrada
 */
router.delete('/:identidade', entidadesController.deleteEntidade);

router.get('/:identidade', entidadesController.getEntidadeById);


router.post('/ciaaerea', entidadesController.createCiaAerea);

router.put('/ciaaerea/:idciaaerea', entidadesController.updateCiaAerea);

router.delete('/ciaaerea/:idciaaerea', entidadesController.deleteCiaAerea);

router.get('/ciaaerea/:identidade', entidadesController.getCiaAereaById);


router.post('/operadora', entidadesController.createOperadora);

router.put('/operadora/:idoperadora', entidadesController.updateOperadora);

router.delete('/operadora/:idoperadora', entidadesController.deleteOperadora);

router.get('/operadora/:identidade', entidadesController.getOperadoraById);


router.post('/vendedor', entidadesController.createVendedor);

router.put('/vendedor/:id', entidadesController.updateVendedor);

router.delete('/vendedor/:id', entidadesController.deleteVendedor);

router.get('/vendedor/:identidade', entidadesController.getVendedorById);


router.post('/emissor', entidadesController.createEmissor);

router.put('/emissor/:idemissor', entidadesController.updateEmissor);

router.delete('/emissor/:idemissor', entidadesController.deleteEmissor);

router.get('/emissor/:identidade', entidadesController.getEmissorById);


router.post('/hotel', entidadesController.createHotel);

router.put('/hotel/:idhotel', entidadesController.updateHotel);

router.delete('/hotel/:idhotel', entidadesController.deleteHotel);

router.get('/hotel/:identidade', entidadesController.getHotelById);


module.exports = router;
