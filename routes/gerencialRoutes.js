const express = require('express');
const router = express.Router();
const gerencialController = require('../controllers/gerencialController');

router.get('/relatorios/planoconta', gerencialController.getRelatorioPlanoConta);
router.get('/relatorios/planocontasintetico', gerencialController.getRelatorioPlanoContaSintetico);
router.get('/relatorios/vendas', gerencialController.getRelatorioVendas);

module.exports = router;
