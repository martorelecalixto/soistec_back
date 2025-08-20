const express = require('express');
const router = express.Router();
const titulospagarController = require('../controllers/titulospagarController');


router.get('/', titulospagarController.getTituloPagar);

router.get('/:idtitulo', titulospagarController.getTituloPagarById);

router.get('/porvendabilhete/:idvenda', titulospagarController.getTituloPagarByVendaBilhete);

router.post('/', titulospagarController.createTituloPagar);

router.put('/:idtitulo', titulospagarController.updateTituloPagar);

router.get('/baixaspagar/:idtitulo', titulospagarController.getBaixaPagarByTitulo);

router.post('/baixaspagar', titulospagarController.createBaixaPagar);

// 1) rotas 100% estáticas primeiro
router.delete('/baixaspag', titulospagarController.deleteBaixasPagar);

// 2) rotas com caminho fixo + param
router.delete('/baixaspagar/:id', titulospagarController.deleteBaixaPagar);
router.delete('/porvendabilhete/:idvenda', titulospagarController.deleteTituloPagarByVendaBilhete);
router.delete('/vendahotel/:idvendahotel', titulospagarController.deleteTituloPagarByVendaHotel); // <-- mudou

// 3) por último a rota genérica (com regex numérica)
router.delete('/:idtitulo', titulospagarController.deleteTituloPagar);

module.exports = router;
