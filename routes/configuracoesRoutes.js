const express = require('express');
const router = express.Router();
const configuracoesController = require('../controllers/configuracoesController');

router.get('/porid', configuracoesController.getConfiguracaoById);

router.get('/', configuracoesController.getConfiguracoes);

router.post('/', configuracoesController.createConfiguracao);

router.put('/:id', configuracoesController.updateConfiguracao);

router.delete('/:id', configuracoesController.deleteConfiguracao);


module.exports = router;
