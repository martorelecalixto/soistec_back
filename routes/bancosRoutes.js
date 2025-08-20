const express = require('express');
const router = express.Router();
const bancosController = require('../controllers/bancosController');

router.get('/', bancosController.getBancos);

router.post('/', bancosController.createBanco);

router.put('/:id', bancosController.updateBanco);

router.delete('/:id', bancosController.deleteBanco);

router.get('/', bancosController.getBancosDropDown);

router.get('/', bancosController.getBancosContasDropDown);

module.exports = router;
