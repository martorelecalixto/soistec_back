const express = require('express');
const router = express.Router();
const copetsController = require('../controllers/copetsController');

router.post('/', copetsController.createCopet);

router.put('/:id', copetsController.updateCopet);

router.delete('/:id', copetsController.deleteCopet);

router.get('/relatorios/analitico', copetsController.getRelatoriosAnalitico);

router.get('/buscarintersecao', copetsController.getBuscarCopet);

router.get('/:id', copetsController.getCopetById);

router.get('/', copetsController.getCopet);

module.exports = router;
