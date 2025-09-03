const express = require('express');
const router = express.Router();
const titulosreceberController = require('../controllers/titulosreceberController');

router.get('/lancamentos', titulosreceberController.getTituloReceberLancamento);
router.get('/baixasreceber/:idtitulo', titulosreceberController.getBaixaReceberByTitulo);
router.get('/porvendabilhete/:idvenda', titulosreceberController.getTituloReceberByVendaBilhete);
router.get('/:idtitulo', titulosreceberController.getTituloReceberById);
router.get('/', titulosreceberController.getTituloReceber);

router.post('/baixasreceber', titulosreceberController.createBaixaReceber);
router.post('/baixasrecebergenerica', titulosreceberController.createBaixasReceberGenerica);
router.post('/', titulosreceberController.createTituloReceber);

router.put('/:idtitulo', titulosreceberController.updateTituloReceber);

// 1) rotas 100% estáticas primeiro
router.delete('/baixasrec', titulosreceberController.deleteBaixasReceber);

// 2) rotas com caminho fixo + param
router.delete('/baixasreceber/:id', titulosreceberController.deleteBaixaReceber);
router.delete('/porvendabilhete/:idvenda', titulosreceberController.deleteTituloReceberByVendaBilhete);
router.delete('/vendahotel/:idvendahotel', titulosreceberController.deleteTituloReceberByVendaHotel); // <-- mudou

// 3) por último a rota genérica (com regex numérica)
router.delete('/:idtitulo', titulosreceberController.deleteTituloReceber);

module.exports = router;
