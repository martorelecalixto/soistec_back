const express = require('express');
const router = express.Router();
const graficosController = require('../controllers/graficosController');

router.get('/aereo', graficosController.getGraficoAereo);
router.get('/servico', graficosController.getGraficoServico);
router.get('/pagar', graficosController.getGraficoPagar);  
router.get('/receber', graficosController.getGraficoReceber);
router.get('/totais', graficosController.getTotais);

module.exports = router;
