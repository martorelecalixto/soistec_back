const express = require('express');
const router = express.Router();
const tiposeventosController = require('../controllers/tiposeventosController');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/', tiposeventosController.getTiposEventos);

router.post('/', tiposeventosController.createTipoEvento);

router.put('/:idtipo', tiposeventosController.updateTipoEvento);

router.delete('/:id', tiposeventosController.deleteTipoEvento);

router.get('/', tiposeventosController.getTiposEventosDropDown);


module.exports = router;
