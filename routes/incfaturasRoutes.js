const express = require('express');
const router = express.Router();
const incfaturaController = require('../controllers/incfaturaController');


router.get('/:idempresa', incfaturaController.incFatura);

module.exports = router;
