const express = require('express');
const router = express.Router();
const permissoesController = require('../controllers/permissoesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/dentro', permissoesController.getPermissoesDentro);

router.get('/fora', permissoesController.getPermissoesFora);

router.get('/', permissoesController.getPermissoes);

router.post('/', permissoesController.createPermissao);

router.put('/:id', permissoesController.updatePermissao);

//router.delete('/:id', permissoesController.deletePermissao);
router.delete('/:idgrupopermissao/:idrecurso', permissoesController.deletePermissao);

module.exports = router;
