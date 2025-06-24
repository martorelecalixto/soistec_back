const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login de usuário
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@example.com
 *               senha:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 nome:
 *                   type: string
 *                 email:
 *                   type: string
 *                 fctoken:
 *                   type: string
 *                 empresa:
 *                   type: string
*       401:
 *         description: E-mail ou senha inválidos
 *       500:
 *         description: Erro no servidor
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Realiza logout do usuário
 *     tags:
 *       - Autenticação
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 */
router.post('/logout', authController.logout);

router.get('/', authController.getUsuarios);

router.post('/', authController.createUsuario);

router.put('/:idusuario', authController.updateUsuario);

router.delete('/:idusuario', authController.deleteUsuario);


module.exports = router;
