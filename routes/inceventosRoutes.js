const express = require('express');
const router = express.Router();
const inceventosController = require('../controllers/inceventosController');

router.get('/:idempresa', inceventosController.incEvento);

module.exports = router;
