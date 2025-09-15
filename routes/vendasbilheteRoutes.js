const express = require('express');
const router = express.Router();
const vendasbilheteController = require('../controllers/vendasbilheteController');



router.post('/', vendasbilheteController.createVendasBilhete);

router.put('/:idvenda', vendasbilheteController.updateVendasBilhete);

router.delete('/:idvenda', vendasbilheteController.deleteVendasBilhete);

router.get('/relatorios/analitico', vendasbilheteController.getRelatoriosAnalitico);

router.get('/relatorios/sintetico', vendasbilheteController.getRelatoriosSintetico);

router.get('/tembaixa/:idvenda', vendasbilheteController.getTemBaixa);

router.get('/:idvenda', vendasbilheteController.getVendasBilheteById);

router.get('/', vendasbilheteController.getVendasBilhete);

module.exports = router;
