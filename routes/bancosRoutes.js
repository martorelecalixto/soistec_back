const express = require('express');
const router = express.Router();
const bancosController = require('../controllers/bancosController');

router.delete('/lancamentos/deletegenerico', bancosController.deleteLancamentoGenerico);

router.delete('/:id', bancosController.deleteBanco);

router.post('/', bancosController.createBanco);

router.put('/:idbanco', bancosController.updateBanco);

router.get('/lancamentos/saldoanterior', bancosController.getLancamentoSaldoAnterior);

router.get('/lancamentos/saldoatual', bancosController.getLancamentoSaldoAtual);

router.get('/lancamentos', bancosController.getLancamento);

router.get('/', bancosController.getBancos);

router.get('/', bancosController.getBancosDropDown);

router.get('/', bancosController.getBancosContasDropDown);

module.exports = router;
