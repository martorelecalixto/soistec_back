const express = require('express');
const router = express.Router();
const vendaseventoController = require('../controllers/vendaseventoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:idevento', vendaseventoController.getVendasEventoById);

router.get('/', vendaseventoController.getVendasEvento);

router.post('/', vendaseventoController.createVendasEventos);

router.put('/:idevento', vendaseventoController.updateVendasEventos);

router.delete('/:idevento', vendaseventoController.deleteVendasEventos);


module.exports = router;
