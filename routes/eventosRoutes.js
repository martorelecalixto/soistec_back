const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventosController');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/', eventosController.getEventos);

router.post('/', eventosController.createEventos);

router.put('/:idevento', eventosController.updateEventos);

router.delete('/:idevento', eventosController.deleteEventos);

router.get('/', eventosController.getEventosDropDown);


module.exports = router;
