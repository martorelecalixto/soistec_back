const express = require('express');
const router = express.Router();
const faturasController = require('../controllers/faturasController');

router.get('/', faturasController.getFatura);

router.get('/emissao', faturasController.getEmissao);

router.get('/:idfatura', faturasController.getFaturaById);

router.post('/', faturasController.createFatura);

router.put('/:idfatura', faturasController.updateFatura);

router.delete('/:idfatura', faturasController.deleteFatura);

module.exports = router;
