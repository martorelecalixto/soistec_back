const express = require('express');
const router = express.Router();
const titulospagarController = require('../controllers/titulospagarController');

router.get('/relatorios/analitico', titulospagarController.getRelatoriosAnalitico);
router.get('/lancamentos', titulospagarController.getTituloPagarLancamento);
router.get('/porvendabilhete/:idvenda', titulospagarController.getTituloPagarByVendaBilhete);
router.get('/porvendahotel/:idvenda', titulospagarController.getTituloPagarByVendaHotel);
router.get('/baixaspagar/:idtitulo', titulospagarController.getBaixaPagarByTitulo);
router.get('/:idtitulo', titulospagarController.getTituloPagarById);
router.get('/', titulospagarController.getTituloPagar);

router.post('/baixaspagar', titulospagarController.createBaixaPagar);
router.post('/baixaspagargenerica', titulospagarController.createBaixasPagarGenerica);
router.post('/', titulospagarController.createTituloPagar);

router.put('/:idtitulo', titulospagarController.updateTituloPagar);

// 1) rotas 100% estáticas primeiro
router.delete('/baixaspag', titulospagarController.deleteBaixasPagar);

// 2) rotas com caminho fixo + param
router.delete('/baixaspagar/:id', titulospagarController.deleteBaixaPagar);
router.delete('/porvendabilhete/:idvenda', titulospagarController.deleteTituloPagarByVendaBilhete);
router.delete('/porvendahotel/:idvenda', titulospagarController.deleteTituloPagarByVendaHotel); // <-- mudou

// 3) por último a rota genérica (com regex numérica)
router.delete('/:idtitulo', titulospagarController.deleteTituloPagar);

module.exports = router;
