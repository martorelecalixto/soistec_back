const express = require('express');
const router = express.Router();
const itensvendaeventoController = require('../controllers/itensvendaeventoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:id', itensvendaeventoController.getItensVendaEventoById);

router.get('/porvenda/:idvenda', itensvendaeventoController.getItensVendaEventoByIdVenda);

router.post('/', itensvendaeventoController.createItensVendaEvento);

router.put('/:id', itensvendaeventoController.updateItensVendaEvento);

router.delete('/:id', itensvendaeventoController.deleteItensVendaEvento);


module.exports = router;
