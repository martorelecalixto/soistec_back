const express = require('express');
const router = express.Router();
const grupospermissoesController = require('../controllers/grupospermissoesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', grupospermissoesController.getGruposPermissoes);

router.post('/', grupospermissoesController.createGrupoPermissao);

router.put('/:idgrupopermissao', grupospermissoesController.updateGrupoPermissao);

router.delete('/:id', grupospermissoesController.deleteGrupoPermissao);

module.exports = router;
