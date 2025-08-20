const express = require('express');
const router = express.Router();
const contasbancariasController = require('../controllers/contasbancariasController');

router.get('/', contasbancariasController.getContasBancarias);

router.post('/', contasbancariasController.createContaBancaria);

router.put('/:id', contasbancariasController.updateContaBancaria);

router.delete('/:id', contasbancariasController.deleteContaBancaria);

router.get('/', contasbancariasController.getContasBancariasDropDown);

router.get('/byID/:id', contasbancariasController.getContaBancariaById);

router.get('/dropdown', contasbancariasController.getBancosContasDropDown);

module.exports = router;
