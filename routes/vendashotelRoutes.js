const express = require('express');
const router = express.Router();
const vendashotelController = require('../controllers/vendashotelController');

router.post('/', vendashotelController.createVendasHotel);

router.put('/:idvenda', vendashotelController.updateVendasHotel);

router.delete('/:idvenda', vendashotelController.deleteVendasHotel);

router.get('/relatorios/analitico', vendashotelController.getRelatoriosAnalitico);

router.get('/relatorios/sintetico', vendashotelController.getRelatoriosSintetico);

router.get('/:idvenda', vendashotelController.getVendasHotelById);

router.get('/', vendashotelController.getVendasHotel);

module.exports = router;
