const express = require('express');
const router = express.Router();
const incvendaseventoController = require('../controllers/incvendaseventoController');

router.get('/:idempresa', incvendaseventoController.incVendaEvento);

module.exports = router;
