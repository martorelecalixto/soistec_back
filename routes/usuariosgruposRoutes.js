const express = require('express');
const router = express.Router();
const usuariosgruposController = require('../controllers/usuariosgruposController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/dentro', usuariosgruposController.getUsuariosGruposDentro);

router.get('/fora', usuariosgruposController.getUsuariosGruposFora);

router.get('/', usuariosgruposController.getUsuariosGrupos);

router.post('/', usuariosgruposController.createUsuarioGrupo);

router.put('/:id', usuariosgruposController.updateUsuarioGrupo);

router.delete('/:idgrupopermissao/:idusuario', usuariosgruposController.deleteUsuarioGrupo);

module.exports = router;
