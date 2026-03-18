const express = require('express');
const router = express.Router();
const periodoemissaoController = require('../controllers/periodoemissaoController');


router.get('/buscarpermissao', periodoemissaoController.getBuscarPeriodoEmissao);

router.get('/:id', periodoemissaoController.getPeriodoEmissaoById);

router.get('/', periodoemissaoController.getPeriodoEmissao);

router.post('/', periodoemissaoController.createPeriodoEmissao);

router.put('/:id', periodoemissaoController.updatePeriodoEmissao);

router.delete('/:id', periodoemissaoController.deletePeriodoEmissao);

module.exports = router;
