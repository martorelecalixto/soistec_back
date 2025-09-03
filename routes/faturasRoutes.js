const express = require('express');
const router = express.Router();
const faturasController = require('../controllers/faturasController');

router.get('/impressao', faturasController.getFaturaImpressao);

router.get('/impressaoitens', faturasController.getItensFaturaImpressao);

router.get('/emissao', faturasController.getEmissao);

router.get('/:idfatura', faturasController.getFaturaById);

router.get('/', faturasController.getFatura);

router.post('/deleteFatura', faturasController.deleteFatura);

router.post('/', faturasController.createFatura);

router.put('/:idfatura', faturasController.updateFatura);

//router.delete('/:idfatura', faturasController.deleteFatura);

module.exports = router;
